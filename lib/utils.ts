import { SITE_NAME } from "../constants";

export const title = (pageTitle?: string): string =>
  `${SITE_NAME} | ${pageTitle ?? "Blog"}`;
