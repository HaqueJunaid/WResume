import { usePuterStore } from "lib/puter";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router"
import Ats from "~/components/Ats";
import Details from "~/components/Details";
import Summary from "~/components/Summary";

export const meta = () => ([
    { title: 'WResume | Analysis'},
    { name: 'description', content: 'Detailer analysis of your resume'},
])

const resume = () => {
    const {auth, isLoading, fs, kv} = usePuterStore();
    const { id } = useParams();
    const feedBackRef = useRef('');
    const [state_imageUrl, setImageUrl] = useState('');
    const [state_resumeUrl, setResumeUrl] = useState('');
    const [state_feedback, setFeedback] = useState<Feedback | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate(`/auth?next=/resume/${id}`);
        }
    }, [auth.isAuthenticated])

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);
            if (!resume) return;

            const data = JSON.parse(resume);

            // console.log(data);

            const resumeBlob = await fs.read(data.resumePath);
            if (!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob], {type: 'application/pdf'});
            const resumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl);

            const imageBlob = await fs.read(data.imagePath);
            if (!imageBlob) return;

            const imageUrl = URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);

            setFeedback(data.feedback);


            feedBackRef.current = data.feedback;
            // console.log(feedBackRef)
        }
        loadResume();
    }, [id])

  return (
    <main className="!pt-0">
        <nav className="resume-nav">
            <Link to={"/"} className="back-button">
                <img src="/icons/back.svg" className="w-2.5 h-2.5" alt="back" />
                <span className="text-gray-800 text-sm font-semibold">Back to homepage</span>
            </Link>
        </nav>
        <div className="flex flex-row w-full max-lg:flex-col-reverse">
            <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
                {state_imageUrl && state_resumeUrl && (
                    <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-2xl:h-fit w-fit">
                        <a href={state_resumeUrl} target="_blank">
                            <img src={state_imageUrl} alt="image" className="w-full h-full object-contain rounded-2xl" title="resume" />
                        </a>
                    </div>
                )}
            </section>
            <section className="feedback-section">
                <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
                {state_feedback 
                    ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={state_feedback} />
                            <Ats score={state_feedback.ATS.score || 0} suggestions={state_feedback.ATS.tips || []} />
                            <Details feedback={state_feedback} />
                        </div>
                    ) 
                    : (<img src="/images/resume-scan-2.gif" className="w-full"/>)
                }
            </section>
        </div>
    </main>
  )
}

export default resume