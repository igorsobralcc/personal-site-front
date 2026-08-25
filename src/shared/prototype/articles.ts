export type ArticleBlock = { type: 'deck' | 'paragraph' | 'heading' | 'note'; text: string }
export interface PrototypeArticle { slug: string; date: string; isoDate: string; title: string; summary: string; readingTime: string; topic: string; featured?: boolean; body?: ArticleBlock[] }

export const prototypeArticles: PrototypeArticle[] = [
  { slug:'designing-api-contracts', date:'August 18, 2026', isoDate:'2026-08-18', title:'Designing API contracts before the interface exists', summary:'How a page-shaped read model can keep teams moving without coupling the product to its first design.', readingTime:'7 min read', topic:'Architecture', featured:true, body:[
    { type:'deck', text:'A stable contract is not a frozen interface. It is a clear promise about the information a product needs.' },
    { type:'paragraph', text:'Starting from screens can make an API imitate the first layout too closely. Starting from raw entities creates a different problem: every interface must reconstruct the same story for itself.' },
    { type:'paragraph', text:"The useful middle is a read model shaped around the user's task. It provides enough structure for a complete first render while leaving typography, hierarchy, and interaction in the hands of the frontend." },
    { type:'note', text:'The contract should describe durable meaning. The interface decides how that meaning appears at each viewport.' },
    { type:'heading', text:'One request, one coherent page' },
    { type:'paragraph', text:'For a portfolio, profile, experience, skills, and featured work belong to one public presentation. Returning them together avoids a request waterfall and gives the client a consistent publication snapshot.' },
  ] },
  { slug:'motion-should-explain', date:'August 6, 2026', isoDate:'2026-08-06', title:'Motion should explain, not decorate', summary:'A practical standard for purposeful interface animation.', readingTime:'5 min read', topic:'Interaction' },
  { slug:'honest-boundaries', date:'July 21, 2026', isoDate:'2026-07-21', title:'Honest boundaries in small systems', summary:'Why a modular monolith is often the most ambitious sensible choice.', readingTime:'9 min read', topic:'Systems' },
  { slug:'responsive-design-starts-with-content', date:'July 2, 2026', isoDate:'2026-07-02', title:'Responsive design starts with content', summary:'Replacing device assumptions with resilient layout decisions.', readingTime:'6 min read', topic:'Frontend' },
]
