/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BuilderState =
  | 'loading'
  | 'walk'
  | 'pulling'
  | 'settle'
  | 'wipe'
  | 'lean'
  | 'point'
  | 'lookAway'
  | 'thumbsUp'
  | 'excited'
  | 'successDoorOpen'
  | 'successEnter';

export type InputFocus = 'none' | 'email' | 'password' | 'button';

export interface MousePosition {
  x: number; // Normalized -1 to 1
  y: number; // Normalized -1 to 1
}

export interface LoginState {
  isLoggedIn: boolean;
  userEmail: string;
}
