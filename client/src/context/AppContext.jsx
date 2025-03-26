import { createContext, useEffect,useState } from "react";
// import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from 'humanize-duration'
import {useAuth,useUser} from "@clerk/clerk-react"
import axios from 'axios'
import { toast } from "react-toastify";
export const AppContext = createContext()


export const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const currency = import.meta.env.VITE_CURRENCY

    const navigate = useNavigate()

    const {getToken} = useAuth()
    const {user} = useUser()

    const [allCourses,setAllCourses] = useState([])
    const [isEducator,setIsEducator] = useState(true)
    const [enrolledCourses , setEnrolledCourses] = useState([])
    const [userData , setUserData] = useState(null)


    const fetchAllCourses = async()=>{
        try{
            // return all the courses available in database
            const {data} = await axios.get(backendUrl+'/api/course/all');

            if (data.sucess)
            {
                setAllCourses(data.courses)
            }

            else{
                // display error message using react toastify
                toast.error(data.message)

            }

        }
        catch{
            toast.error(error.message)



        }
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
        return Math.floor(totalRating / course.courseRatings.length)
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
    // fetch user data
    const fetchUserData = async () => {
        if (user.publicMetadata.role === 'educator')
        {
            setIsEducator(true)
        }
        try {
            const token = await getToken();
    
            const { data } = await axios.get(backendUrl + '/api/user/data', {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            if (data.success) {
                setUserData(data.user);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // function to fetch enrolled course
    const fetchUserEnrolledCourses = async()=>{
        try {
            const token = await getToken();
            const response = await axios.get('/api/user/enrolled-courses', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setEnrolledCourses(response.data.enrolledCourses.reverse());
            }
            else
            {
                toast.error(error.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error fetching enrolled courses");
        }
       
    }

  
    useEffect(() => {
        fetchAllCourses();
        if (user) {
            fetchUserEnrolledCourses();
        }
    })

    useEffect(()=>{
        if(user)
        {
            fetchUserData()
            fetchUserEnrolledCourses()
        }
    }, [user])

    
    const value = {
        currency, 
        allCourses, 
        navigate, 
        calculateRating, 
        isEducator, 
        setIsEducator, 
        calculateNoOfLectures,
        calculateChapterTime,
        calculateCourseDuration, 
        enrolledCourses,
        fetchUserEnrolledCourses,
        userData,
        setUserData,
        getToken

    }


    return (
        <AppContext.Provider value={value}>
            {props.children}

        </AppContext.Provider>
    )
}





 
   

  
    
