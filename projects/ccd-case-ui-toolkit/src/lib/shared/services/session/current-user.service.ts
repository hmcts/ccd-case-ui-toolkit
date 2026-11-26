import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MemoizedSelector, select, Store } from '@ngrx/store';
import { UserDetails } from '../../domain/user/user-details.model';
import { UserInfo } from '../../domain/user/user-info.model';
import { safeJsonParse } from '../../json-utils';
import { SessionStorageService } from './session-storage.service';

/** The session holds UserInfo and non-sensitive UserDetails fields under the legacy key. */
export const USER_INFO_SESSION_KEY = 'userDetails';
export const CURRENT_USER_DETAILS = new InjectionToken<Observable<UserDetails>>('CURRENT_USER_DETAILS');

interface StoredCurrentUser extends UserInfo {
  canShareCases?: UserDetails['canShareCases'];
  sessionTimeout?: UserDetails['sessionTimeout'];
  roleAssignmentInfo?: UserDetails['roleAssignmentInfo'];
}

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private static transientToken: string | null = null;
  private static transientUserId: string | null = null;
  private static detailsLoaded = false;

  constructor(
    private readonly sessionStorage: SessionStorageService,
    @Optional() @Inject(CURRENT_USER_DETAILS) private readonly details$?: Observable<UserDetails>
  ) {}

  /** Synchronous identity data, available before the application store has loaded. */
  public getUserInfo(): UserInfo | null {
    return CurrentUserService.readUserInfo(this.sessionStorage);
  }

  public setUserInfo(userInfo: UserInfo): void {
    CurrentUserService.writeUserInfo(this.sessionStorage, userInfo);
  }

  /** Session identity together with API-only permissions and assignments. */
  public getUserDetails(): Observable<UserDetails> {
    if (!this.details$) {
      throw new Error('CURRENT_USER_DETAILS has not been provided');
    }
    return this.details$;
  }

  public getUserInfo$(): Observable<UserInfo | null> {
    return this.getUserDetails().pipe(map((details) => details?.userInfo ?? null));
  }

  public static parseUserInfo(value: string | null): UserInfo | null {
    const stored = CurrentUserService.parseStoredCurrentUser(value);
    return CurrentUserService.userInfoFromStored(stored);
  }

  public static readUserInfo(storage: Pick<Storage, 'getItem'>): UserInfo | null {
    return CurrentUserService.parseUserInfo(storage?.getItem(USER_INFO_SESSION_KEY));
  }

  public static readUserId(storage: Pick<Storage, 'getItem'>): string | null {
    const userInfo = CurrentUserService.readUserInfo(storage);
    return userInfo?.id || userInfo?.uid || null;
  }

  public static writeUserInfo(storage: Pick<Storage, 'setItem'>, userInfo: UserInfo): void {
    CurrentUserService.transientToken = userInfo.token ?? null;
    CurrentUserService.transientUserId = userInfo.id || userInfo.uid || null;
    storage.setItem(USER_INFO_SESSION_KEY, JSON.stringify(CurrentUserService.toSessionUserInfo(userInfo)));
  }

  /** Remove sensitive fields left by an older app version without changing the user record. */
  public static scrubStoredUserInfo(storage: Pick<Storage, 'getItem' | 'setItem'>): void {
    const stored = CurrentUserService.parseStoredCurrentUser(storage.getItem(USER_INFO_SESSION_KEY));
    if (stored && ['token', 'iss', 'ssoProvider', 'sub', 'subname'].some((field) => field in stored)) {
      storage.setItem(USER_INFO_SESSION_KEY, JSON.stringify(CurrentUserService.toSessionUserInfo(stored)));
    }
  }

  /** Persist identity, permissions, assignments, and timeout in one session record. */
  public static setUserDetails(storage: Pick<Storage, 'setItem'>, details: UserDetails): void {
    CurrentUserService.transientToken = details.userInfo.token ?? null;
    CurrentUserService.transientUserId = details.userInfo.id || details.userInfo.uid || null;
    const stored: StoredCurrentUser = {
      ...CurrentUserService.toSessionUserInfo(details.userInfo),
      canShareCases: details.canShareCases,
      sessionTimeout: details.sessionTimeout,
      roleAssignmentInfo: details.roleAssignmentInfo
    };
    storage.setItem(USER_INFO_SESSION_KEY, JSON.stringify(stored));
    CurrentUserService.detailsLoaded = true;
  }

  public static readUserDetails(storage: Pick<Storage, 'getItem'>): UserDetails {
    if (!CurrentUserService.detailsLoaded) {
      return {
        canShareCases: false,
        sessionTimeout: { idleModalDisplayTime: 0, totalIdleTime: 0 },
        userInfo: null
      };
    }
    const stored = CurrentUserService.parseStoredCurrentUser(storage.getItem(USER_INFO_SESSION_KEY));
    return {
      canShareCases: stored?.canShareCases ?? false,
      sessionTimeout: stored?.sessionTimeout ?? { idleModalDisplayTime: 0, totalIdleTime: 0 },
      roleAssignmentInfo: stored?.roleAssignmentInfo,
      userInfo: CurrentUserService.userInfoFromStored(stored)
    };
  }

  public static resetUserDetails(): void {
    CurrentUserService.transientToken = null;
    CurrentUserService.transientUserId = null;
    CurrentUserService.detailsLoaded = false;
  }

  /** The bearer token stays in memory and is only available for the current session user. */
  public static getTransientToken(storage: Pick<Storage, 'getItem'>): string | null {
    const userId = CurrentUserService.readUserId(storage);
    return userId && userId === CurrentUserService.transientUserId ? CurrentUserService.transientToken : null;
  }

  /** An absent session is valid; a present but malformed value is not. */
  public static isStoredUserInfoValid(storage: Pick<Storage, 'getItem'>): boolean {
    const value = storage.getItem(USER_INFO_SESSION_KEY);
    return !value || CurrentUserService.parseUserInfo(value) !== null;
  }

  /** Adapter for applications that use an NgRx selector to notify subscribers of updates. */
  public static selectUserDetails(store: Store<any>, selector: MemoizedSelector<any, UserDetails>): Observable<UserDetails> {
    return store.pipe(select(selector));
  }

  private static toSessionUserInfo(userInfo: UserInfo): UserInfo {
    const sessionUserInfo = { ...userInfo };
    delete sessionUserInfo.token;
    delete sessionUserInfo.iss;
    delete sessionUserInfo.ssoProvider;
    delete sessionUserInfo.sub;
    delete sessionUserInfo.subname;
    return sessionUserInfo;
  }

  private static parseStoredCurrentUser(value: string | null): StoredCurrentUser | null {
    const parsed = safeJsonParse<unknown>(value, null);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed as StoredCurrentUser;
  }

  private static userInfoFromStored(stored: StoredCurrentUser | null): UserInfo | null {
    if (!stored) return null;
    const { canShareCases, sessionTimeout, roleAssignmentInfo, ...userInfo } = stored;
    return userInfo;
  }
}
