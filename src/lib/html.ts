import sanitizeHtml from "sanitize-html";

const articleSanitizeConfig: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "blockquote",
    "pre",
    "code",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "figure",
    "figcaption",
    "iframe",
    "video",
    "source",
    "div",
    "span",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    iframe: ["src", "title", "width", "height", "allow", "allowfullscreen"],
    video: ["src", "controls", "poster", "width", "height"],
    source: ["src", "type"],
    "*": ["class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: {
    img: ["http", "https"],
    video: ["http", "https"],
    source: ["http", "https"],
  },
  allowedIframeHostnames: [
    "www.youtube.com",
    "youtube.com",
    "www.youtube-nocookie.com",
  ],
  transformTags: {
    a: (_tagName, attribs) => ({
      tagName: "a",
      attribs: {
        ...attribs,
        rel: "noopener noreferrer",
        target: attribs.target === "_self" ? "_self" : "_blank",
      },
    }),
  },
  exclusiveFilter: (frame) =>
    (frame.tag === "iframe" || frame.tag === "img") && !frame.attribs.src,
};

export function sanitizeArticleHtml(html: string) {
  return sanitizeHtml(html, articleSanitizeConfig);
}

const commentSanitizeConfig: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
};

export function sanitizeCommentHtml(html: string) {
  return sanitizeHtml(html, commentSanitizeConfig).trim();
}
