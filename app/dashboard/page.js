'use client'
import React, {useState} from "react";
import {CiSearch, CiBellOn} from 'react-icons/ci';
import { GrDocumentText } from "react-icons/gr";
import { IoIosArrowForward } from "react-icons/io";
import { MdArrowForward, MdArrowBack } from "react-icons/md";
import { FaSuitcase } from "react-icons/fa";
import Link from "next/link";

export default function DashboardPage() {
    const [isResumeSelected, setIsResumeSelected] = useState(true)

    const jobs = [
        {
          id: 1,
          title: "Software Engineer",
          company: "Tech Corp",
          location: "Calgary, AB",
          url: "https://example.com/job/1",
        },
        {
          id: 2,
          title: "Data Analyst",
          company: "Data Inc",
          location: "Edmonton, AB",
          url: "https://example.com/job/2",
        },
        {
          id: 3,
          title: "Product Manager",
          company: "Innovate LLC",
          location: "Vancouver, BC",
          url: "https://example.com/job/3",
        },
        {
          id: 4,
          title: "UX Designer",
          company: "Design Co",
          location: "Toronto, ON",
          url: "https://example.com/job/4",
        },
        {
          id: 5,
          title: "DevOps Engineer",
          company: "Cloud Solutions",
          location: "Montreal, QC",
          url: "https://example.com/job/5",
        },
        {
          id: 6,
          title: "Marketing Specialist",
          company: "Advertise Pro",
          location: "Ottawa, ON",
          url: "https://example.com/job/6",
        },
    ];

    return(
        <div className="flex bg-gray-50 text-black flex-col overflow-auto p-6">
            <div className="flex items-center justify-between w-full sticky top-0 left-0">
                <p className="text-2xl">My Dashboard</p>
                <div className="flex space-x-5 items-center">
                    <CiSearch size={30}/>
                    <CiBellOn size={30}/>
                    <button className="bg-blue-600 px-4 py-2 rounded text-white">
                        <p>Create New</p>
                    </button>
                </div>
            </div>
            <div className="flex items-center justify-between w-full my-14">
                <div>
                    <h1 className="text-4xl font-semibold tracking-wide">Hey, User</h1>
                    <p className="text-gray-600">What do u want to create.</p>
                </div>
                <div className="flex gap-x-8">
                <div className="flex items-center space-x-4 border px-4 py-2 w-[300px] duration-300 transition-all hover:scale-105 hover:bg-gray-200">
                    <GrDocumentText size={25} className="text-blue-800"/>
                    <div>
                        <p className="font-semibold tracking-wide text-lg">Resume</p>
                        <p className="text-gray-500">Build a resume.</p>
                    </div>
                </div>
                <Link href={'/cover-letter/'} className="flex items-center space-x-4 border px-4 py-2  w-[300px] duration-300 transition-all hover:scale-105 hover:bg-gray-200">
                    <GrDocumentText size={25} className="text-blue-800"/>
                    <div>
                        <p className="font-semibold tracking-wide text-lg">Cover Letter</p>
                        <p className="text-gray-500">Create a custom cover letter.</p>
                    </div>
                </Link>
                <div className="flex items-center space-x-4 border px-4 py-2  w-[300px] duration-300 transition-all hover:scale-105 hover:bg-gray-200">
                    <GrDocumentText size={25} className="text-blue-800"/>
                    <div>
                        <p className="font-semibold tracking-wide text-lg">Resignation Letter</p>
                        <p className="text-gray-500">Write a Resignation Letter.</p>
                    </div>
                </div>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <div className="space-x-[30px]">
                <button className={`px-2 ${isResumeSelected ? 'border-b-2 border-blue-700' : ''}`} onClick={() => setIsResumeSelected(true)}>
                    <p className="text-xl tracking-wide">Resume</p>
                </button>
                <button className= {`px-2 ${isResumeSelected ? '' : 'border-b-2 border-blue-700'}`} onClick={() => setIsResumeSelected(false)}>
                    <p className="text-xl tracking-wide">Cover Letter</p>
                </button>
                </div>
                <div>
                    <button className="flex items-center gap-x-1 px-4 py-1 border-2 rounded">
                        View All <IoIosArrowForward/>
                    </button>
                </div>
            </div>

            <div className="flex justify-between my-10">
                <div className="flex flex-col justify-between w-3/5 border rounded-xl p-5">
                    <div className="flex my-3 items-center">
                        <p className="text-2xl font-semibold w-full tracking-wide">
                            Trending Jobs
                        </p>
                        <div className="flex gap-x-4">
                            <MdArrowBack size={30} className="border rounded-full"/>
                            <MdArrowForward size={30} className="border rounded-full bg-black text-white"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        {jobs.map((job) => (
                            <div key={job.id} className="flex justify-between border p-4 rounded-lg shadow-sm">
                                <div>
                                    <h2 className="text-lg font-semibold">{job.title}</h2>
                                    <p className="text-gray-600">{job.company}</p>
                                    <p className="text-gray-500">{job.location}</p>
                                </div>
                                <button className="font-semibold tracking-wide">
                                    Apply
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center w-2/5 gap-3 text-center">
                    <div className="p-10 rounded-full bg-purple-400">
                        <FaSuitcase size={70} className="text-white"/>
                    </div>
                    <p className="text-3xl font-bold tracking-wide w-[400px]">Create your own Job Application.</p>
                    <p className="text-gray-500">Save time job hunting.  get more out of it</p>
                    <button className="px-3 py-2 text-white bg-blue-600 rounded-lg text-lg">Get Started</button>
                </div>
            </div>
        </div>
    )
}