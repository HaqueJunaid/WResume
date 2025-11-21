import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "WResume" },
    { name: "description", content: "A resume analyzer for your next job" },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResume, setLoadingResume] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate('/auth?next=/');
    }
  }, [auth.isAuthenticated])

  useEffect(() => {
    const loadResume = async () => {
      setLoadingResume(true);
      const resumes = (await kv.list(`resume:*`, true)) as KVItem[];

      const parsedResumes = resumes?.map((resume) => (
        JSON.parse(resume.value) as Resume
      ))

      setResumes(parsedResumes || []);
      setLoadingResume(false);
    }
    loadResume();
  }, [])

  return <main className="bg-[url('/images/bg-main.svg')] bg-cover bg-center">

    <Navbar />
    <section className="main-section">
      <div className="page-heading py-16">
        <h1>Monitor Your Resume & Application Status</h1>
        <h2>Get objective, AI-backed feedback to strengthen your resume.</h2>
      </div>
      {
        resumes.length > 0 && (
          <div className="resumes-section gap-10" title="Resume">
            {
              !loadingResume && resumes.map((resume) => (
                <ResumeCard key={resume.id} resume={resume} />
              ))
            }
          </div>
        )
      }
      {
        !loadingResume && resumes.length === 0 && (
          <div className="gradient-border p-6">
            <div className="bg-white flex flex-col items-center justify-center gap-4 p-6 rounded-2xl">
            <h2>No resumes found</h2>
            <Link to="/upload" className="primary-button w-fit text-xl font-semibold">Upload</Link>
            </div>
          </div>
        )
      }
      {
        loadingResume && (
          <div className="flex flex-col items-center justify-center">
            <img src="/images/resume-scan-2.gif" className="w-[200px]" />
          </div>
        )
      }
    </section>
  </main>;
}
