import { createContext, useEffect,useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from 'humanize-duration'
import {useAuth,useUser} from "@clerk/clerk-react"
export const AppContext = createContext()


export const AppContextProvider = (props) => {

    const currency = import.meta.env.VITE_CURRENCY

    const navigate = useNavigate()

    const {getToken} = useAuth()
    const {user} = useUser()

    const [allCourses,setAllCourses] = useState([])
    const [isEducator,setIsEducator] = useState(true)
    const [enrolledCourses , setEnrolledCourses] = useState([])

    const fetchAllCourses = async()=>{
        setAllCourses(dummyCourses)
    }

    // function to caluclate avg ratings
    const calculateRating = (course)=> {
        if(course.courseRatings.length === 0){
            return 0;
        }
        let totalRating = 0;
        course.courseRatings.forEach(rating => {
            totalRating += rating.rating
        })
        return totalRating / course.courseRatings.length
    }

    // function to calculate course chapter time
    const calculateChapterTime = (chapter) => {
        let time = 0;
        chapter.chapterContent.map((lecture=> time += lecture.lectureDuration))
        return humanizeDuration(time * 60 * 1000 , {units:["h","m"]})
    }

    // function to calculate course duration
    const calculateCourseDuration = (course)=>{
        let time=0;
        course.courseContent.map((chapter)=> chapter.chapterContent.map(
            (lecture) => time += lecture.lectureDuration
        ))
        return humanizeDuration(time * 60 * 1000 , {units:["h","m"]})

    }

    // function to calculate total np. of lectures
    const calculateNoOfLectures = (course)=>{
        let totalLec = 0;
        course.courseContent.forEach(chapter => {
            if(Array.isArray(chapter.chapterContent)){
                totalLec += chapter.chapterContent.length;
            }
        });
        return totalLec;
    }

    // function to fetch enrolled course
    const fetchUserEnrolledCourses = async()=>{
        setEnrolledCourses(dummyCourses)
    }

    const logToken = async()=> {
        console.log(await getToken());
    }

    useEffect(()=> {
        if(user){
            logToken()
        }
    })
            


    useEffect(()=>{
        fetchAllCourses()
        fetchUserEnrolledCourses()
    },[])
    const value = {

        currency, allCourses, navigate , calculateRating , isEducator, setIsEducator, calculateNoOfLectures,
         calculateChapterTime,calculateCourseDuration, enrolledCourses,fetchUserEnrolledCourses

    }

    return (
        <AppContext.Provider value={value}>
            {props.children}

        </AppContext.Provider>
    )
}