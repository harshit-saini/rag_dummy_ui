// Small progress bar + stage label for one document. This is what makes
// the pipeline "visible" to the user while it is being processed.

function ProcessingStatus({ status, stageLabel, progress }) {
  const isReady = status === 'ready'

  return (
    <div className="processing-status">
      <div className="progress-bar-track">
        <div
          className={isReady ? 'progress-bar-fill ready' : 'progress-bar-fill'}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className={isReady ? 'stage-label ready' : 'stage-label'}>
        {isReady ? '✅ ' : '⏳ '}
        {stageLabel} ({progress}%)
      </span>
    </div>
  )
}

export default ProcessingStatus
