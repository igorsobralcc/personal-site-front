import { usePresentation } from '../features/presentation/usePresentation'
import { ErrorPanel, PageLoader } from '../shared/components/States'

import type { ReactElement } from 'react'

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(value),
  )

export function PresentationPage(): ReactElement {
  const query = usePresentation()
  if (query.isLoading) return <PageLoader label="Loading presentation" />
  if (query.isError || !query.data)
    return (
      <ErrorPanel
        title="The presentation couldn’t be loaded."
        onRetry={() => void query.refetch()}
      />
    )
  const { profile, skillCategories, projects, experiences } = query.data
  return (
    <>
      <header className="page-header">
        <div className="container">
          <p className="eyebrow">Presentation</p>
          <h1 tabIndex={-1}>Engineering with the whole product in view.</h1>
          <p className="lede">{profile.shortSummary ?? profile.headline}</p>
        </div>
      </header>
      <section className="container content-section">
        <div className="about-grid">
          <div>
            <p className="eyebrow">01 / About</p>
            <p className="pullquote">
              A software engineer who enjoys the space between a good idea and a dependable release.
            </p>
          </div>
          <div className="about-copy">
            <p>{profile.biography}</p>
            {profile.currentFocus && <p>{profile.currentFocus}</p>}
            {profile.socialLinks.length > 0 && (
              <ul className="social-links" aria-label="Social profiles">
                {profile.socialLinks.map((link) => (
                  <li key={link.url}>
                    <a href={link.url} target="_blank" rel="noreferrer">
                      {link.label} profile ↗
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {skillCategories.length > 0 && (
          <div className="capability-grid">
            {skillCategories.map((category) => (
              <article className="capability-card" key={category.id}>
                <h3>{category.name}</h3>
                <ul>
                  {category.skills.map((skill) => (
                    <li key={skill.id}>{skill.name}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>
      {projects.length > 0 && (
        <section className="surface-section">
          <div className="container content-section">
            <p className="eyebrow">02 / Selected work</p>
            <h2 className="section-title">Built for real use.</h2>
            <p className="section-intro">
              Products where thoughtful interfaces meet maintainable engineering.
            </p>
            <ul className="project-list">
              {projects.map((project, index) => (
                <li key={project.id}>
                  <article className="project-card">
                    <span className="project-number">{String(index + 1).padStart(2, '0')}</span>
                    {project.image && (
                      <img
                        className="project-image"
                        src={project.image.url}
                        alt={project.image.alt}
                        width={project.image.width}
                        height={project.image.height}
                        loading="lazy"
                      />
                    )}
                    <div>
                      <h3>{project.name}</h3>
                      <p>{project.summary}</p>
                      {(project.liveUrl || project.repositoryUrl) && (
                        <div className="project-links">
                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Open ${project.name} live project`}
                            >
                              Live project ↗
                            </a>
                          )}
                          {project.repositoryUrl && (
                            <a
                              href={project.repositoryUrl}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Open ${project.name} source repository`}
                            >
                              Source ↗
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <ul className="tags" aria-label={`${project.name} technologies`}>
                      {project.technologies.map((tech) => (
                        <li key={tech.id}>{tech.name}</li>
                      ))}
                    </ul>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      {experiences.length > 0 && (
        <section className="container content-section">
          <p className="eyebrow">03 / Experience</p>
          <h2 className="section-title">Progress through practice.</h2>
          <ol className="timeline">
            {experiences.map((item) => (
              <li key={item.id}>
                <p>
                  <time dateTime={item.startDate}>{formatDate(item.startDate)}</time> —{' '}
                  {item.endDate ? (
                    <time dateTime={item.endDate}>{formatDate(item.endDate)}</time>
                  ) : (
                    'Present'
                  )}
                </p>
                <div>
                  <h3>{item.role}</h3>
                  <strong>{item.company}</strong>
                  <p>{item.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  )
}
