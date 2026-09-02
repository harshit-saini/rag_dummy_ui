// All our "fake data" lives in this one file so it's easy to find.
// This is basically the browser-side twin of backend/app/store.py - we
// could not share code between Python and JS so we just wrote the same
// idea twice, once for each side.

export const PIPELINE_STAGES = [
  { key: 'uploaded', label: 'File uploaded', progress: 5 },
  { key: 'extracting_text', label: 'Extracting text from PDF', progress: 25 },
  { key: 'chunking', label: 'Splitting document into chunks', progress: 50 },
  { key: 'generating_embeddings', label: 'Generating embeddings', progress: 75 },
  { key: 'indexing', label: 'Adding chunks to vector index', progress: 90 },
  { key: 'ready', label: 'Ready for questions', progress: 100 },
]

const DOMAINS = [
  'Natural Language Processing',
  'Computer Vision',
  'Machine Learning',
  'Deep Learning',
  'Information Retrieval',
]

const KEYWORD_POOL = [
  'transformers', 'attention mechanism', 'semantic search', 'embeddings',
  'neural networks', 'fine-tuning', 'text classification', 'summarization',
  'vector database', 'self-supervised learning', 'tokenization',
  'knowledge graph', 'question answering', 'retrieval augmented generation',
]

const SUMMARY_SENTENCES = [
  'This paper presents a new approach to improve model performance on the given task.',
  'The authors evaluate their method on multiple benchmark datasets and report improved results.',
  'A key contribution of this work is a more efficient way to process large amounts of text data.',
  'The proposed technique reduces training time while keeping accuracy competitive with existing methods.',
  'Experimental results show that the method generalizes well across different domains.',
  'The paper also discusses limitations of the approach and possible directions for future work.',
]

const FAKE_PAGE_TEMPLATES = [
  'Introduction: In recent years, research on {domain} has grown rapidly. This section motivates the problem and explains why {keyword} is important.',
  'Related Work: Several prior studies have explored {keyword} in the context of {domain}. We build on these ideas and extend them further.',
  'Methodology: We describe our proposed pipeline which makes use of {keyword} to solve the problem more effectively than earlier baselines.',
  'Experiments: We test our approach on standard datasets related to {domain} and compare it against baseline models using {keyword}.',
  'Results and Discussion: Our model outperforms the baseline and we analyse why {keyword} helped improve the results for {domain} tasks.',
  'Conclusion: We summarise our findings on {domain} and highlight how {keyword} can be used in future research.',
]

// tiny helper to grab N random unique items from an array
function sampleArray(arr, n) {
  const copy = [...arr]
  const result = []
  while (result.length < n && copy.length > 0) {
    const index = Math.floor(Math.random() * copy.length)
    result.push(copy.splice(index, 1)[0])
  }
  return result
}

function makeFakePages(domain, keywords) {
  return FAKE_PAGE_TEMPLATES.map((template, i) => {
    const keyword = keywords[i % keywords.length]
    const text = template.replace('{domain}', domain).replaceAll('{keyword}', keyword)
    return { chunkId: `chunk-${i + 1}-${Date.now()}`, page: i + 1, text }
  })
}

// This is our fake "in-browser database". Since there is no backend in
// mock mode, we just keep everything in this array for the lifetime of
// the browser tab (it resets on refresh, which is fine for a demo).
export const mockDocuments = []
export const mockChunksByDoc = {}

let idCounter = 1

export function createMockDocument(filename, size) {
  const id = `mock-doc-${idCounter++}`
  const domain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)]
  const keywords = sampleArray(KEYWORD_POOL, 4)
  const pages = makeFakePages(domain, keywords)
  const summary = sampleArray(SUMMARY_SENTENCES, 3).join(' ')

  const doc = {
    id,
    name: filename,
    size,
    status: PIPELINE_STAGES[0].key,
    stageLabel: PIPELINE_STAGES[0].label,
    progress: PIPELINE_STAGES[0].progress,
    domain,
    keywords,
    summary,
    pages: pages.length,
    uploadedAt: Date.now() / 1000,
  }

  mockDocuments.unshift(doc)
  mockChunksByDoc[id] = pages
  return doc
}

export function getMockDocument(id) {
  return mockDocuments.find((d) => d.id === id)
}
