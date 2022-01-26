import React, {useState} from 'react';
import {sanityClient, urlFor} from '../../sanity'
import Header from '../../components/Header'
import {Post} from '../../typings'
import { GetStaticProps } from 'next';
import PortableText from "react-portable-text";
import {useForm, SubmitHandler} from 'react-hook-form';

interface IFormInput{
 _id:string;
 name:string;
 email:string;
 comment:string;   
}

interface Props {
    post: Post;
}

function Post({ post }: Props) {
    const [submitted, setSubmitted] = useState(false)
    const {register, handleSubmit, formState: {errors}} = useForm<IFormInput>(); //so our form knows it can have only the types mentioned in the interface
    
    const onSubmit: SubmitHandler<IFormInput> = (data) => {
        fetch('/api/createComment',{
           method: 'POST',
           body: JSON.stringify(data)
       }).then(() => {
           console.log(data);
           setSubmitted(true);
       }).catch((err)=>{
            console.log(err);
            setSubmitted(false);
       })             
    };
    
    return ( 
  <main>
      <Header/>
      <img className='object-cover w-full h-40' src={urlFor(post.mainImage).url()!} alt="banner img" />
      <article className='max-w-3xl p-5 mx-auto'>
          <h1 className='mt-10 mb-3 text-3xl'>{post.title}</h1>
          <h2 className='mb-2 text-xl font-light text-gray-500'>{post.description}</h2>
        <div className='flex items-center space-x-2'>
            <img className='w-10 h-10 rounded-full' src={urlFor(post.author.image).url()!} alt="author image" />
            <p className='text-sm font-extralight'>Blog Post by 
            <span className='text-green-800'>{post.author.name}</span>
            Published at{" "} {new Date(post._createdAt).toDateString()}</p>
        </div>
      <div className='mt-10'>
          <PortableText
          className=''
          dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
          projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
          content={post.body}
          serializers={{
            h1: (props:any) => {
                <h1 className="mb-5 text-2xl font-bold" {...props}/>
            },
            h2: (props:any) => {
                <h1 className="mb-5 text-xl font-bold" {...props}/>
            },
            li: ({children}:any) => {
                <li className="ml-4 list-disc">{children}</li>
            },
            link: ({href, children}:any) => {
                <a href={href} className="text-blue-500 hover:underline">
                    {children}
                </a>
            }
        }}
          />    
      </div>
      </article>
      <hr className="max-w-lg mx-auto my-5 border border-yellow-500"/>
      {submitted ? (
          <div className="flex-col max-w-2xl py-10 mx-auto my-10 text-3xl text-white bg-yellow-500">
              <h3 className="text-3xl font-bold">Thank you for submitting your comment!</h3>
              <p>Once it has been approved, it'll appear below!</p>
          </div>
      ) :
      (
         <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col max-w-2xl p-10 mx-auto'>
             <h3 className="text-sm text-yellow-500">Enjoyed this article?</h3>
             <h4 className="text-3xl font-bold">Leave a comment below!</h4>
             <hr className="py-3 mt-2"/>
                
             <input {...register("_id")} type="hidden" name="_id" value={post._id}/>
             <label className='block mb-5'>
                 <span className='text-gray-700'>Name</span>
                 <input {...register("name", {required:true})} className='block w-full px-3 py-2 mt-1 border rounded shadow outline-none form-input ring-yellow-500 focus:ring' type="text" placeholder="John Doe" />
             </label>
             <label className='block mb-5'>
                 <span className='text-gray-700'>Email</span>
                 <input {...register("email", {required:true})} className='block w-full px-3 py-2 mt-1 border rounded shadow outline-none form-input ring-yellow-500 focus:ring' type="text" placeholder="John Doe" />
             </label>
             <label className='block mb-5'>
                 <span className='text-gray-700'>Comment</span>
                 <textarea {...register("comment", {required:true})} className='block w-full px-3 py-2 mt-1 border rounded shadow outline-none form-textarea focus:ring ring-yellow-500' placeholder="John Doe" rows={8} />
             </label>
             
             {/* errors when fields are left empty */}
             <div className='flex flex-col'>
                 {errors.name && (
                     <span className='text-red-500'>- The name is required</span>
                 )}
                 {errors.email && (
                     <span className='text-red-500'>- The email is required</span>
                 )}
                 {errors.comment && (
                     <span className='text-red-500'>- The comment is required</span>
                 )}
             </div>
             <input className='px-4 py-2 mt-2 font-bold text-white bg-yellow-500 rounded shadow cursor:pointer hover:bg-yellow-400 focus:shadow-outline focus:outline-none' type="submit" />
         </form>
     ) 
    }
    <div className='flex flex-col max-w-2xl p-10 mx-auto my-10 space-y-2 shadow shadow-yellow-500'>
        <h3 className='text-4xl'>Comments</h3>
        <hr className="pb-2"/>
        {post.comments.map((comment) => (
        <div key={comment._id}>
            <p>
            <span className='text-yellow-500'>{comment.name}: </span>{comment.comment}
            </p>
        </div>
         ))}
    </div>
  </main>
  );
}

export default Post;

//ISR implementation - prefetching all the routes over here to tell Next.js which routes to pre-prepare for
export const getStaticPaths = async () => {
    const query = `*[ _type == "post"]{
        _id, 
        slug{
            current
        }, 
     }`;

    const posts = await sanityClient.fetch(query);
    
    const paths = posts.map((post:Post) => ({
        params: {
            slug: post.slug.current,
        }
    }));

    return {
        paths,
        fallback: 'blocking', //block the page from showing if it doesn't exist
    };
};

export const getStaticProps:GetStaticProps = async ({params}) => {
    const query = `*[_type == "post" && slug.current == $slug][0]{
    _id,
    _createdAt, 
    title, 
    author-> {
      name, 
      image
    },
    'comments': *[
        _type == "comment" &&
        post._ref == ^._id &&
        approved == true], 
    description,
    mainImage,  
    slug,
    body
}`

    const post = await sanityClient.fetch(query,{
        slug:params?.slug, //we know params is undefined here
    });

    if(!post) {
        return { 
            notFound: true // this will return a 404 page not found
        }
    }
    return{
        props: {
            post,
            revalidate: 60, //This is ISR implemented so what its gonna its gonna refresh the old cache every 60 seconds
        }
    }
}

//We used getStaticPaths to fetch the paths first of all kind of cross checking if the path to the page
//exists