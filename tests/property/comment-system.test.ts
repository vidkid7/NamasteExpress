import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fc from "fast-check";
import { PrismaClient } from "@prisma/client";

if (process.env.NODE_ENV === "production") {
  throw new Error("Property tests must not run against production database!");
}

const prisma = new PrismaClient();
const TEST_PREFIX = "test-comment";
let testUserId: string;
let testArticleId: string;

beforeAll(async () => {
  await prisma.commentVote.deleteMany({
    where: { comment: { article: { slug: { startsWith: TEST_PREFIX } } } },
  });
  await prisma.comment.deleteMany({
    where: { article: { slug: { startsWith: TEST_PREFIX } } },
  });
  await prisma.article.deleteMany({ where: { slug: { startsWith: TEST_PREFIX } } });
  await prisma.category.deleteMany({ where: { slug: { startsWith: TEST_PREFIX } } });
  await prisma.user.deleteMany({ where: { email: { startsWith: TEST_PREFIX } } });

  const user = await prisma.user.create({
    data: {
      name: "Comment Test User",
      email: `${TEST_PREFIX}-user@test.local`,
      password_hash: "$2a$12$placeholder",
      role: "READER",
    },
  });
  testUserId = user.id;

  // Need a second user for vote toggling tests
  await prisma.user.create({
    data: {
      name: "Comment Voter 2",
      email: `${TEST_PREFIX}-voter2@test.local`,
      password_hash: "$2a$12$placeholder",
      role: "READER",
    },
  });

  const cat = await prisma.category.create({
    data: { name: "Comment Test Cat", slug: `${TEST_PREFIX}-cat` },
  });

  const article = await prisma.article.create({
    data: {
      title: "Comment Test Article",
      slug: `${TEST_PREFIX}-article`,
      content: "Content for comment tests",
      category_id: cat.id,
      author_id: user.id,
      status: "PUBLISHED",
      published_at: new Date(),
    },
  });
  testArticleId = article.id;
});

afterAll(async () => {
  await prisma.commentVote.deleteMany({
    where: { comment: { article_id: testArticleId } },
  });
  await prisma.comment.deleteMany({ where: { article_id: testArticleId } });
  await prisma.article.deleteMany({ where: { slug: { startsWith: TEST_PREFIX } } });
  await prisma.category.deleteMany({ where: { slug: { startsWith: TEST_PREFIX } } });
  await prisma.user.deleteMany({ where: { email: { startsWith: TEST_PREFIX } } });
  await prisma.$disconnect();
});

const commentContentArb = fc
  .string({ minLength: 1, maxLength: 500 })
  .filter((s) => s.trim().length > 0);

describe("Property 9: Comment Creation Persists Data", () => {
  it("comment content and relationships are stored correctly (100+ iterations)", async () => {
    await fc.assert(
      fc.asyncProperty(commentContentArb, async (content) => {
        const comment = await prisma.comment.create({
          data: {
            content,
            article_id: testArticleId,
            user_id: testUserId,
            status: "APPROVED",
          },
        });

        expect(comment.content).toBe(content);
        expect(comment.article_id).toBe(testArticleId);
        expect(comment.user_id).toBe(testUserId);
        expect(comment.like_count).toBe(0);
        expect(comment.dislike_count).toBe(0);

        // Re-read
        const fetched = await prisma.comment.findUnique({ where: { id: comment.id } });
        expect(fetched).not.toBeNull();
        expect(fetched!.content).toBe(content);

        await prisma.comment.delete({ where: { id: comment.id } });
      }),
      { numRuns: 110 }
    );
  });
});

describe("Property 10: Vote Counting Accuracy", () => {
  it("like and dislike counts are accurate after votes (100+ iterations)", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 0, max: 5 }),
        async (likeCount, dislikeCount) => {
          const comment = await prisma.comment.create({
            data: {
              content: "Vote counting test",
              article_id: testArticleId,
              user_id: testUserId,
              status: "APPROVED",
              like_count: likeCount,
              dislike_count: dislikeCount,
            },
          });

          const fetched = await prisma.comment.findUnique({ where: { id: comment.id } });
          expect(fetched!.like_count).toBe(likeCount);
          expect(fetched!.dislike_count).toBe(dislikeCount);

          // Increment like
          const afterLike = await prisma.comment.update({
            where: { id: comment.id },
            data: { like_count: { increment: 1 } },
          });
          expect(afterLike.like_count).toBe(likeCount + 1);
          expect(afterLike.dislike_count).toBe(dislikeCount);

          // Increment dislike
          const afterDislike = await prisma.comment.update({
            where: { id: comment.id },
            data: { dislike_count: { increment: 1 } },
          });
          expect(afterDislike.dislike_count).toBe(dislikeCount + 1);

          await prisma.comment.delete({ where: { id: comment.id } });
        }
      ),
      { numRuns: 110 }
    );
  });
});

describe("Property 11: Vote Toggling", () => {
  it("creating and removing a vote correctly adjusts counts (100+ iterations)", async () => {
    await fc.assert(
      fc.asyncProperty(fc.boolean(), async (isLike) => {
        const comment = await prisma.comment.create({
          data: {
            content: "Toggle vote test",
            article_id: testArticleId,
            user_id: testUserId,
            status: "APPROVED",
            like_count: 0,
            dislike_count: 0,
          },
        });

        // Add a vote
        const vote = await prisma.commentVote.create({
          data: {
            comment_id: comment.id,
            user_id: testUserId,
            is_like: isLike,
          },
        });

        await prisma.comment.update({
          where: { id: comment.id },
          data: isLike
            ? { like_count: { increment: 1 } }
            : { dislike_count: { increment: 1 } },
        });

        let afterVote = await prisma.comment.findUnique({ where: { id: comment.id } });
        if (isLike) {
          expect(afterVote!.like_count).toBe(1);
          expect(afterVote!.dislike_count).toBe(0);
        } else {
          expect(afterVote!.like_count).toBe(0);
          expect(afterVote!.dislike_count).toBe(1);
        }

        // Toggle off (remove vote)
        await prisma.commentVote.delete({ where: { id: vote.id } });
        await prisma.comment.update({
          where: { id: comment.id },
          data: isLike
            ? { like_count: { decrement: 1 } }
            : { dislike_count: { decrement: 1 } },
        });

        afterVote = await prisma.comment.findUnique({ where: { id: comment.id } });
        expect(afterVote!.like_count).toBe(0);
        expect(afterVote!.dislike_count).toBe(0);

        await prisma.comment.delete({ where: { id: comment.id } });
      }),
      { numRuns: 110 }
    );
  });
});
