/**
 * Describes control options for the {@link TruexAdRenderer#init(String, TruexAdOptions)} call.
 */
export class TruexAdOptions {

  /**
   * if true, enables the userCancelStream event for back actions from the choice card.
   * Defaults to false, which means back actions cause optOut/adCompleted events instead.
   */
  public supportsUserCancelStream?: boolean = false;

  /**
   * The id to be used for user ad tracking. Usually omitted so that the platform's own
   * advertising tracking id can be used.
   */
  public userAdvertisingId?: string | null = null;

  /**
   * The id used for user ad tracking when no explicit user ad id is provided or available
   * from the platform. By default it is a randomly generated UUID. Specifying it allows
   * one to control if limited ad tracking is truly random per ad, or else shared across
   * multiple TAR ad sessions, e.g. during the playback of a single video.
   */
  public fallbackAdvertisingId?: string | null = null;

  // Optional appId
  public appId?: string | null = null;

  /**
   * If true, remote web view debugging using Chrome via chrome://inspect is enabled event for
   * release builds. Otherwise it is allowed only for debug builds or with QA trueX ads
   * (i.e. from qa-get.truex.com end point).
   */
  public enableWebViewDebugging? = false;
}

