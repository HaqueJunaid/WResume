import React, { useState } from 'react'
import Navbar from '~/components/Navbar'
import FileUploader from '~/components/FileUploader';
import { usePuterStore } from 'lib/puter';
import { useNavigate } from 'react-router';
import { convertPdfToImage } from 'lib/pdf2img';
import { generateUuid } from '~/utils/uuidGenerator';
import { AIResponseFormat, prepareInstructions } from '../../constants';

const upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const navigator = useNavigate();

    const handleAnalyze = async ({companyName,jobTitle,jobDescription,file}: {companyName: string, jobTitle: string, jobDescription: string, file: File}) => {
        setIsProcessing(true);
        setStatus("Uploading the file...");

        const uploadedFile = await fs.upload([file]);

        if (!uploadedFile) 
            return setStatus("File uploading failed...")
        
        setStatus("Converting to image...")
        const imageFile = await convertPdfToImage(file);

        if (!imageFile.file) 
            return setStatus("Failed to convert to image. Please try again.");

        setStatus("Uploading the image...");
        const uploadedImage = await fs.upload([imageFile.file]);

        if (!uploadedImage) 
            return setStatus("Image uploading failed...")

        setStatus("Preparing the data...");

        const uuid = generateUuid();

        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName,
            jobTitle,
            jobDescription,
            feedback: ''
        }

        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        setStatus("Analyzing...");

        const response = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({jobTitle, jobDescription})
        )

        if (!response) 
            return setStatus("Failed to analyze the resume. Please try again.");

        const feedbackText = typeof response.message.content === 'string'
                         ? response.message.content
                         : response.message.content[0].text;

        data.feedback = JSON.parse(feedbackText);

        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        setStatus("Resume analyzed successfully...");
        console.log(data);
        navigator(`/resume/${uuid}`);
    }
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form: any = e.currentTarget.closest('form');

        if (!form) return;

        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if (!file) return;

        handleAnalyze({companyName, jobTitle, jobDescription, file});
    }
    const handleFileSelect = (file: File | null) => {
        setFile(file);
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover bg-center">
            <Navbar />
            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Upload Your Resume & Get Feedback.</h1>
                    {
                        isProcessing ? (
                            <>
                                <h2>{status}</h2>
                                <img src="/images/resume-scan.gif" alt="resume-scan" className="w-full" />
                            </>
                        ) : (
                        <h2>Drop your resume for analysis</h2>
                    )
                    }
                    {
                        !isProcessing && (
                            <form id='upload-form' onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8'>
                                <div className="form-div">
                                    <label htmlFor="company-name">Company Name</label>
                                    <input type="text" name="company-name" placeholder='Enter company name' id='company-name' />
                                </div>
                                <div className="form-div">
                                    <label htmlFor="job-title">Job Title</label>
                                    <input type="text" name="job-title" placeholder='Enter job title' id='job-title' />
                                </div>
                                <div className="form-div">
                                    <label htmlFor="job-desription">Job Description</label>
                                    <textarea rows={5} name="job-description" id="job-description" placeholder='Enter job description' ></textarea>
                                </div>
                                <div className="form-div">
                                    <label htmlFor="uploader">Upload Resume</label>
                                    <FileUploader onFileSelect={handleFileSelect} />
                                </div>
                                <button type="submit" className='primary-button'>
                                    <p>Analyze Resume</p>
                                </button>
                            </form>
                        )
                    }
                </div>
            </section>
        </main>
    )
}

export default upload