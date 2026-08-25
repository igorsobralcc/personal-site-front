import { Link, useParams } from 'react-router-dom'
import { prototypeArticles } from '../shared/prototype/articles'

export function ArticlePage() {
  const { slug } = useParams()
  const article = import.meta.env.DEV ? prototypeArticles.find(item => item.slug === slug) : undefined
  if (!article) return <section className="empty-page"><Link className="back-link" to="/articles">← Back to Articles</Link><h1 tabIndex={-1}>Article not found</h1><p>This essay may have moved or may not exist yet.</p></section>
  return <article className="reader"><Link className="back-link" to="/articles">← Back to Articles</Link><div className="article-meta"><span className="topic">{article.topic}</span><span>·</span><time dateTime={article.isoDate}>{article.date}</time><span>·</span><span>{article.readingTime}</span></div><h1 tabIndex={-1}>{article.title}</h1><div className="prose-article">{article.body ? article.body.map((block,index) => {
    if (block.type === 'heading') return <h2 key={index}>{block.text}</h2>
    if (block.type === 'note') return <aside className="note" key={index}>{block.text}</aside>
    return <p className={block.type === 'deck' ? 'deck' : undefined} key={index}>{block.text}</p>
  }) : <p>This essay is coming soon.</p>}</div></article>
}
