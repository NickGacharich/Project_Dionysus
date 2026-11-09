import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.services';
import { AuthUser } from '../../shared/models/auth.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  user: AuthUser | null = null;

  displayName = '';
  selectedAvatar = 'avatar-1';

  saving = false;
  successMessage = '';
  errorMessage = '';

  avatars = [
    { id: 'avatar-1', emoji: '🧙' },
    { id: 'avatar-2', emoji: '🦇' },
    { id: 'avatar-3', emoji: '🐺' },
    { id: 'avatar-4', emoji: '🦊' },
    { id: 'avatar-5', emoji: '👹' },
    { id: 'avatar-6', emoji: '🦉' },
    { id: 'avatar-7', emoji: '🗡️' },
    { id: 'avatar-8', emoji: '🐉' },
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.authService.getMe().subscribe({
      next: (response) => {
        this.user = response.user;
        this.displayName =
          response.user.displayName || response.user.username;
        this.selectedAvatar =
          response.user.avatar || 'avatar-1';
      },
      error: (error) => {
        console.error('Failed to load profile:', error);
        this.errorMessage = 'Unable to load your profile.';
      },
    });
  }

  selectAvatar(avatarId: string): void {
    this.selectedAvatar = avatarId;
  }

  saveProfile(): void {
    if (this.saving || !this.displayName.trim()) {
      return;
    }

    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.authService.updateProfile({
      displayName: this.displayName.trim(),
      avatar: this.selectedAvatar,
    }).subscribe({
      next: (response) => {
        this.user = response.user;

        // Update the locally stored user information.
        const currentUser = this.authService.getCurrentUser();

        if (currentUser) {
          sessionStorage.setItem(
            'dionysus_user',
            JSON.stringify(response.user)
          );
        }

        this.successMessage = 'Profile updated successfully!';
        this.saving = false;
      },
      error: (error) => {
        console.error('Failed to update profile:', error);
        this.errorMessage =
          error.error?.message || 'Unable to update your profile.';
        this.saving = false;
      },
    });
  }

  get initials(): string {
    return (
      this.displayName.charAt(0).toUpperCase() || 'U'
    );
  }

  get selectedAvatarEmoji(): string {
    return (
      this.avatars.find(
        (avatar) => avatar.id === this.selectedAvatar
      )?.emoji || '🧙'
    );
  }
}