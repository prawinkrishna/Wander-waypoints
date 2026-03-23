import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MarketplaceService, BidMessage } from '../../../core/service/marketplace.service';

@Component({
    selector: 'app-bid-chat',
    templateUrl: './bid-chat.component.html',
    styleUrls: ['./bid-chat.component.scss']
})
export class BidChatComponent implements OnInit, OnDestroy, AfterViewChecked {
    @Input() bidId!: string;
    @Input() currentUserId!: string;

    @ViewChild('messageContainer') messageContainer!: ElementRef;

    messages: BidMessage[] = [];
    newMessage = '';
    loading = false;
    sending = false;
    private destroy$ = new Subject<void>();
    private pollInterval: ReturnType<typeof setInterval> | null = null;
    private shouldScroll = false;

    constructor(private marketplaceService: MarketplaceService) {}

    ngOnInit(): void {
        this.loadMessages();
        this.pollInterval = setInterval(() => {
            if (!document.hidden) {
                this.loadMessages();
            }
        }, 10000);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }

    ngAfterViewChecked(): void {
        if (this.shouldScroll) {
            this.scrollToBottom();
            this.shouldScroll = false;
        }
    }

    loadMessages(): void {
        if (!this.bidId) return;

        this.loading = this.messages.length === 0;
        this.marketplaceService.getMessages(this.bidId).pipe(takeUntil(this.destroy$)).subscribe({
            next: (messages) => {
                const hadMessages = this.messages.length;
                this.messages = messages;
                this.loading = false;
                if (messages.length > hadMessages) {
                    this.shouldScroll = true;
                }
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    sendMessage(): void {
        const content = this.newMessage.trim();
        if (!content || this.sending) return;

        this.sending = true;
        this.marketplaceService.sendMessage(this.bidId, content).pipe(takeUntil(this.destroy$)).subscribe({
            next: (message) => {
                this.messages.push(message);
                this.newMessage = '';
                this.sending = false;
                this.shouldScroll = true;
            },
            error: () => {
                this.sending = false;
            }
        });
    }

    isCurrentUser(message: BidMessage): boolean {
        return message.sender?.userId === this.currentUserId;
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    trackByMessageId(_index: number, message: BidMessage): string {
        return message.messageId;
    }

    private scrollToBottom(): void {
        try {
            if (this.messageContainer) {
                const el = this.messageContainer.nativeElement;
                el.scrollTop = el.scrollHeight;
            }
        } catch (_) {}
    }
}
