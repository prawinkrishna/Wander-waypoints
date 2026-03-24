import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/service/auth.service';
import { SocialService } from '../core/service/social.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  profileForm!: FormGroup;
  loading = false;
  submitting = false;
  successMessage = '';
  errorMessage = '';
  user: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private socialService: SocialService,
    private router: Router
  ) { }

  ngOnInit() {
    this.initForm();
    this.loadUserProfile();
  }

  initForm() {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      bio: ['', [Validators.maxLength(150)]],
      location: [''],
      profileImage: [''],
      coverImage: [''],
      isPublicProfile: [true]
    });
  }

  loadUserProfile() {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();

    if (currentUser?.userId && currentUser.userId !== 'guest') {
      this.socialService.getPublicProfile(currentUser.userId).subscribe({
        next: (data) => {
          this.user = data;
          this.profileForm.patchValue({
            username: data.username,
            bio: data.bio,
            location: data.location || '',
            profileImage: data.profileImage || '',
            coverImage: data.coverImage || '',
            isPublicProfile: data.isPublicProfile !== false // Default true
          });
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = 'Failed to load profile data';
          this.loading = false;
        }
      });
    } else {
      this.router.navigate(['/auth']);
    }
  }

  onSubmit() {
    if (this.profileForm.invalid) return;

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updateData = this.profileForm.value;
    const userId = this.user.userId;

    this.socialService.updateProfile(userId, updateData).subscribe({
      next: (response) => {
        this.successMessage = 'Profile updated successfully!';
        this.submitting = false;

        // Update local user data if needed
        // this.authService.updateCurrentUser(response);

        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 1500);
      },
      error: (err) => {
        this.errorMessage = 'Failed to update profile. Please try again.';
        this.submitting = false;
      }
    });
  }

  onCancel() {
    this.router.navigate(['/profile']);
  }
}
