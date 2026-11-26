import { blockContent, blockContentLite, embed } from "./blockContent";
import { openingHoursSpec, postalAddress } from "./contact";
import { figure } from "./figure";
import { achievement, highlightStat, projectValueProposition, roleShare, timelineItem, valueItem } from "./items";
import { link, navItem } from "./link";
import { localeString, localeText } from "./locale";
import { faq, legacyId, redirect, socialLink } from "./misc";
import { seo } from "./seo";

/** 20 object dùng chung theo content_model.objects (+ `embed`, khối video trong blockContent). */
export const objectTypes = [
  localeString,
  localeText,
  seo,
  figure,
  link,
  navItem,
  faq,
  redirect,
  legacyId,
  highlightStat,
  valueItem,
  roleShare,
  timelineItem,
  achievement,
  projectValueProposition,
  postalAddress,
  openingHoursSpec,
  socialLink,
  blockContent,
  blockContentLite,
  embed,
];
