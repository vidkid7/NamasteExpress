import type { PrismaClient } from "@prisma/client";
import type { SeedClock } from "./seed-date";

export type SeedSummary = {
  user: number;
  category: number;
  tag: number;
  article: number;
  articleTag: number;
  comment: number;
  commentVote: number;
  bookmark: number;
  mediaFile: number;
  tournament: number;
  team: number;
  match: number;
  reel: number;
  gallery: number;
  galleryImage: number;
  adPosition: number;
  advertisement: number;
  breakingNews: number;
  webStory: number;
  pageView: number;
  siteSettings: number;
  newsletterSubscription: number;
  auditLog: number;
  holiday: number;
  panchangData: number;
  goldSilverPrice: number;
  forexRate: number;
  rashifal: number;
  session: number;
  passwordResetToken: number;
};

export async function verifySeed(
  prisma: PrismaClient,
  clock: SeedClock,
): Promise<SeedSummary> {
  const [
    user, category, tag, article, articleTag, comment, commentVote, bookmark,
    mediaFile, tournament, team, match, reel, gallery, galleryImage, adPosition,
    advertisement, breakingNews, webStory, pageView, siteSettings,
    newsletterSubscription, auditLog, holiday, panchangData, goldSilverPrice,
    forexRate, rashifal, session, passwordResetToken,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.article.count(),
    prisma.articleTag.count(),
    prisma.comment.count(),
    prisma.commentVote.count(),
    prisma.bookmark.count(),
    prisma.mediaFile.count(),
    prisma.tournament.count(),
    prisma.team.count(),
    prisma.match.count(),
    prisma.reel.count(),
    prisma.gallery.count(),
    prisma.galleryImage.count(),
    prisma.adPosition.count(),
    prisma.advertisement.count(),
    prisma.breakingNews.count(),
    prisma.webStory.count(),
    prisma.pageView.count(),
    prisma.siteSettings.count(),
    prisma.newsletterSubscription.count(),
    prisma.auditLog.count(),
    prisma.holiday.count(),
    prisma.panchangData.count(),
    prisma.goldSilverPrice.count(),
    prisma.forexRate.count({ where: { date: clock.day } }),
    prisma.rashifal.count({ where: { ad_date: clock.day } }),
    prisma.session.count(),
    prisma.passwordResetToken.count(),
  ]);

  const summary = {
    user, category, tag, article, articleTag, comment, commentVote, bookmark,
    mediaFile, tournament, team, match, reel, gallery, galleryImage, adPosition,
    advertisement, breakingNews, webStory, pageView, siteSettings,
    newsletterSubscription, auditLog, holiday, panchangData, goldSilverPrice,
    forexRate, rashifal, session, passwordResetToken,
  };
  if (summary.article < 36 || summary.category < 17 || summary.forexRate !== 21 || summary.rashifal !== 12) {
    throw new Error(`Seed verification failed: ${JSON.stringify(summary)}`);
  }
  return summary;
}
