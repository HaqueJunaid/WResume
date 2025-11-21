import { twMerge } from "tailwind-merge"
import ScoreGauge from "./ScoreGauge"

const Summary = ({ feedback }: { feedback: Feedback }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md w-full">
      <div className="flex flex-row items-center p-4 gap-8">
        <ScoreGauge score={feedback.overallScore || 0} />

        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Your Resume Score</h2>
          <p className="text-sm text-gray-500">
            This score is calculated based on variables listed below
          </p>
        </div>
      </div>

      <Category title="Tone & Style" score={feedback.toneAndStyle.score} />
      <Category title="Content" score={feedback.content.score} />
      <Category title="Structure" score={feedback.structure.score} />
      <Category title="Skills" score={feedback.skills.score} />
    </div>
  )
}

const Category = ({ title, score }: { title: string, score: number }) => {
  const textColor = score > 70 ? 'text-green-600'
                  : score > 49 ? 'text-yellow-60'
                  : 'text-red-600';

  const badgeText = score > 80 ? 'Very Good'
                  : score > 49 ? 'Good'
                  : 'bad'

  const badgeBg = score > 70 ? 'bg-green-200 text-green-600'
                : score > 49 ? 'bg-yellow-200 text-yellow-600'
                : 'bg-red-200 text-red-600'

  return (
    <div className="resume-summary">
      <div className="category">
        <div className="flex flex-row gap-2 items-center justify-center">
          <p className="text-2xl">{title}
          </p>
          <div className={twMerge(badgeBg,"text-xs px-[5px] py-0.5 rounded font-medium")}>
            {badgeText}
          </div>
        </div>
        <p className="text-2xl">
          <span className={textColor}>{score}</span>/100
        </p>
      </div>
    </div>
  )
}

export default Summary