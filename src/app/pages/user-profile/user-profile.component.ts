import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocialService } from '../../core/service/social.service';
import { AuthService } from '../../core/service/auth.service';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
    user: any = null;
    loading = true;
    followStatus: 'NONE' | 'PENDING' | 'ACCEPTED' = 'NONE';
    isOwnProfile = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private socialService: SocialService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            const profileId = params['id'];
            if (profileId) {
                this.loadOtherProfile(profileId);
            } else {
                this.loadOwnProfile();
            }
        });
    }

    loadOwnProfile() {
        this.isOwnProfile = true;
        const currentUser = this.authService.getCurrentUser();

        if (currentUser?.userId && currentUser.userId !== 'guest') {
            this.loading = true;
            this.socialService.getPublicProfile(currentUser.userId).subscribe({
                next: (data) => {
                    this.user = data;
                    this.loading = false;
                },
                error: () => {
                    // Fallback to stored user data
                    this.user = currentUser;
                    this.loading = false;
                }
            });
        } else {
            // Guest user - redirect to login
            this.router.navigate(['/auth']);
        }
    }

    loadOtherProfile(id: string) {
        const currentUser = this.authService.getCurrentUser();
        this.isOwnProfile = currentUser?.userId === id;

        this.loading = true;
        this.socialService.getPublicProfile(id).subscribe({
            next: (data) => {
                this.user = data;
                this.loading = false;

                // Check follow status if not own profile
                if (!this.isOwnProfile && currentUser?.userId) {
                    this.socialService.getFollowStatus(id).subscribe({
                        next: (res) => {
                            this.followStatus = res.status || 'NONE';
                        },
                        error: () => {
                            this.followStatus = 'NONE';
                        }
                    });
                }
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    onFollowClicked() {
        if (!this.user) return;

        // Can only follow if not already following
        if (this.followStatus === 'NONE') {
            this.socialService.followUser(this.user.userId).subscribe({
                next: (res) => {
                    this.followStatus = res.status;
                },
                error: (err) => {
                }
            });
        }
    }

    onUnfollowClicked() {
        if (!this.user) return;

        // Can unfollow if PENDING (cancel request) or ACCEPTED (unfollow)
        if (this.followStatus === 'PENDING' || this.followStatus === 'ACCEPTED') {
            this.socialService.unfollowUser(this.user.userId).subscribe({
                next: () => {
                    this.followStatus = 'NONE';
                },
                error: (err) => {
                }
            });
        }
    }

    onEditProfileClicked() {
        this.router.navigate(['/profile/edit']);
    }

    onTripClicked(tripId: string) {
        this.router.navigate(['/trip-details', tripId]);
    }

    onTabChanged(tab: string) {
        // Tab changed - could be used for analytics or lazy loading
    }
}
