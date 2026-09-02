export default function WorkflowPage() {
  const steps = [
    { name: 'Proposal', description: 'Initial project proposal submission' },
    { name: 'Verification', description: 'Land records verification' },
    { name: 'Scrutiny', description: 'Committee review and scrutiny' },
    { name: 'Notification', description: 'Publish acquisition notification' },
    { name: 'Award', description: 'Land award declaration' },
    { name: 'Compensation', description: 'Compensation assessment & payment' },
    { name: 'Possession', description: 'Physical possession of land' },
    { name: 'R&R', description: 'Rehabilitation & resettlement' },
    { name: 'Completed', description: 'Project completion' }
  ]

  const currentStep = 7

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <header className="space-y-4">
        <div>
          <div className="text-xs font-body font-semibold text-bhumisetu-muted uppercase tracking-wider mb-2">Workflow Demo</div>
          <h1 className="font-display text-5xl leading-tight text-bhumisetu-darkest">Acquisition Lifecycle</h1>
        </div>
        <p className="text-gray-700 font-body text-lg max-w-2xl">
          From proposal to possession — one connected view of land, people, progress and risk.
        </p>
      </header>

      {/* Workflow Timeline */}
      <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-subtle">
        <div className="space-y-6">
          {steps.map((step, index) => {
            const isActive = index < currentStep
            const isCurrent = index === currentStep - 1
            const isCompleted = index < currentStep - 1

            return (
              <div key={step.name} className="relative">
                {/* Timeline Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-16 w-1 h-12 bg-gray-300" />
                )}

                {/* Step Card */}
                <div className={`flex gap-6 p-6 rounded-2xl border-2 transition-all ${
                  isCurrent
                    ? 'border-bhumisetu-brass bg-yellow-50 shadow-elevated'
                    : isActive
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  {/* Step Number */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                    isCurrent
                      ? 'bg-bhumisetu-brass text-white'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-bhumisetu-forest text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="font-display text-xl text-bhumisetu-darkest mb-2">
                      {step.name}
                      {isCompleted && <span className="ml-3 text-sm text-green-600">✓ Completed</span>}
                      {isCurrent && <span className="ml-3 text-sm font-bold text-bhumisetu-brass">● Current</span>}
                    </div>
                    <p className="text-gray-600 font-body text-sm">{step.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Progress Summary */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
          <div className="text-xs font-body font-semibold text-green-900 uppercase tracking-wider mb-2">Steps Completed</div>
          <div className="font-display text-4xl text-green-600 mb-2">{currentStep - 1}</div>
          <div className="text-sm text-green-700 font-body">of {steps.length} total steps</div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <div className="text-xs font-body font-semibold text-blue-900 uppercase tracking-wider mb-2">Current Step</div>
          <div className="font-display text-2xl text-blue-600 mb-2">{steps[currentStep - 1].name}</div>
          <div className="text-sm text-blue-700 font-body">{steps[currentStep - 1].description}</div>
        </div>

        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
          <div className="text-xs font-body font-semibold text-amber-900 uppercase tracking-wider mb-2">Remaining Steps</div>
          <div className="font-display text-4xl text-amber-600 mb-2">{steps.length - currentStep}</div>
          <div className="text-sm text-amber-700 font-body">Steps until completion</div>
        </div>
      </section>

      {/* Process Description */}
      <section className="bg-gradient-to-br from-bhumisetu-cream to-bhumisetu-surface rounded-2xl p-8 border border-gray-300">
        <h2 className="font-display text-2xl text-bhumisetu-darkest mb-6">Process Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-body font-semibold text-bhumisetu-forest mb-3">Early Stage</h3>
            <ul className="space-y-2 text-sm text-gray-700 font-body">
              <li className="flex gap-2">
                <span className="text-bhumisetu-brass">→</span>
                <span><strong>Proposal:</strong> Project inception and planning</span>
              </li>
              <li className="flex gap-2">
                <span className="text-bhumisetu-brass">→</span>
                <span><strong>Verification:</strong> Validate land records</span>
              </li>
              <li className="flex gap-2">
                <span className="text-bhumisetu-brass">→</span>
                <span><strong>Scrutiny:</strong> Committee evaluation</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-body font-semibold text-bhumisetu-forest mb-3">Execution & Completion</h3>
            <ul className="space-y-2 text-sm text-gray-700 font-body">
              <li className="flex gap-2">
                <span className="text-bhumisetu-brass">→</span>
                <span><strong>Award to Possession:</strong> Legal transfers</span>
              </li>
              <li className="flex gap-2">
                <span className="text-bhumisetu-brass">→</span>
                <span><strong>R&R:</strong> Support for affected communities</span>
              </li>
              <li className="flex gap-2">
                <span className="text-bhumisetu-brass">→</span>
                <span><strong>Completion:</strong> Project handoff</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
