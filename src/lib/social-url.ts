const emailPattern =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

export function isValidEmail(value: string | undefined): value is string {
  return Boolean(value && emailPattern.test(value));
}

export function isVerifiedHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function isVerifiedMailtoUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "mailto:") return false;
    return isValidEmail(decodeURIComponent(parsed.pathname));
  } catch {
    return false;
  }
}

/** HTTPS profiles and mailto addresses; rejects http / javascript / empty mailto. */
export function isVerifiedSocialUrl(value: string): boolean {
  return isVerifiedHttpsUrl(value) || isVerifiedMailtoUrl(value);
}
