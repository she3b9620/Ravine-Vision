"use client";

import { useTransition } from "react";
import RAVINEOpenAuth from "@/components/open-auth-link";
import { submitWorkComment } from "@/app/[locale]/works/[workId]/actions";

type CommentItem = {
  id: string;
  body: string;
  created_at: string;
  authorName: string;
  authorHandle: string | null;
};

type WorkDiscussionProps = {
  workId: string;
  locale: string;
  isAuthenticated: boolean;
  comments: CommentItem[];
};

export default function WorkDiscussion({
  workId,
  locale,
  isAuthenticated,
  comments,
}: WorkDiscussionProps) {
  const [isPending, startTransition] = useTransition();
  const ar = locale === "ar";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;
    startTransition(async () => {
      await submitWorkComment(formData);
      form.reset();
    });
  };

  return (
    <section className="work-discussion-section" aria-label={ar ? "حوار وتأملات" : "Discussion & reflections"}>
      <div className="discussion-header">
        <h2>{ar ? "حوار وتأملات حول العمل" : "Discourse & Reflections"}</h2>
        <p className="discussion-charter-note">
          {ar
            ? "النقاش في رافين يركز على استكشاف الفكرة، وتفكيك العمل، والتعلم المشترك، في إطار من الاحترام الكامل لكرامة الإنسان."
            : "Discourse on RAVINE explores the essence of the work, creative inquiry, and mutual learning with full respect for human dignity."}
        </p>
      </div>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="work-comment-form">
          <input type="hidden" name="work_id" value={workId} />
          <input type="hidden" name="locale" value={locale} />
          <label htmlFor="comment-body" className="sr-only">
            {ar ? "اكتب تأملك أو تعليقك" : "Write your reflection or comment"}
          </label>
          <textarea
            id="comment-body"
            name="body"
            rows={4}
            required
            maxLength={5000}
            placeholder={
              ar
                ? "شارك قراءتك النقدية أو تأملك الفكري في هذا العمل..."
                : "Share your thoughtful reading, question, or reflection on this work..."
            }
            disabled={isPending}
          />
          <div className="comment-form-actions">
            <button type="submit" className="action-button-accent" disabled={isPending}>
              {isPending
                ? ar
                  ? "جارٍ النشر..."
                  : "Posting..."
                : ar
                ? "نشر التأمل"
                : "Post reflection"}
            </button>
          </div>
        </form>
      ) : (
        <div className="discussion-guest-prompt">
          <p>
            {ar
              ? "للمشاركة في الحوار ومناقشة صانع العمل، سجّل الدخول إلى مجتمع رافين."
              : "To participate in the discourse and engage with the creator, sign in to RAVINE."}
          </p>
          <RAVINEOpenAuth className="action-button-accent">
            {ar ? "تسجيل الدخول للمشاركة ↗" : "Sign in to participate ↗"}
          </RAVINEOpenAuth>
        </div>
      )}

      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="empty-comments-state">
            <p>
              {ar
                ? "لم تُسجل تأملات أو قراءات بعد. كن أول من يفتتح الحوار حول هذا العمل."
                : "No reflections recorded yet. Be the first to open the discourse on this work."}
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const formattedDate = new Date(comment.created_at).toLocaleDateString(
              ar ? "ar-EG" : "en-GB",
              { year: "numeric", month: "short", day: "numeric" }
            );

            return (
              <article key={comment.id} className="comment-card">
                <header className="comment-header">
                  <div className="comment-author-avatar" aria-hidden="true">
                    {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : "R"}
                  </div>
                  <div className="comment-author-meta">
                    <span className="comment-author-name">{comment.authorName || (ar ? "عضو في رافين" : "RAVINE Member")}</span>
                    {comment.authorHandle && (
                      <span className="comment-author-handle">@{comment.authorHandle}</span>
                    )}
                    <time dateTime={comment.created_at} className="comment-date">
                      {formattedDate}
                    </time>
                  </div>
                </header>
                <div className="comment-body">
                  <p>{comment.body}</p>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
