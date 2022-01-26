import Head from 'next/head'
import Header from '../components/Header'
import {sanityClient, urlFor} from '../sanity'
import {Post} from '../typings'
import Link from 'next/link'

interface Props{
  posts: [Post];
}

export default function Home({posts}:Props) {
  console.log(posts);
  
  return (
    <div className="mx-auto max-w-7xl">
      <Head>
        <title>
          Medium Blog
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header/>
      <div className='flex items-center justify-between py-10 bg-yellow-400 border-black lg:py-0 border-y'>
        <div className='px-10 space-y-5'>
          <h1 className="max-w-xl font-serif text-6xl"><span className="underline decoration-black decoration-4">Medium</span> is a place to write, read and connect</h1>
          <h2>
            It's easy and free to post your thinking on any topic and
            connect with millions of readers.
          </h2>
        </div>
        <div>
          <img className='hidden h-32 md:inline-flex lg:h-full' 
          src="https://accountabilitylab.org/wp-content/uploads/2020/03/Medium-logo.png" 
          alt="" />
        </div>
      </div>
      {/* posts */}
      <div className="grid grid-cols-1 gap-3 p-2 sm:grid-cols-2 lg:grid-cols-3 md:p-6 md:gap-6">
        {posts.map((post) => (
          // console.log(post.slug.current);
          // console.log(post.mainImage);
          // console.log(post.title);
                  
          <Link key={post._id} href={`/post/${post.slug.current}`}>
            <div className='overflow-hidden border rounded-lg cursor-pointer group'>
              <img className='object-cover w-full transition-transform duration-200 ease-in-out h-60 group-hover:scale-105' src={urlFor(post.mainImage).url()!} alt="main image" />
              <div className='flex justify-between p-5 bg-white'>  
                <div>
                  <p className='text-lg font-bold'>{post.title}</p>
                  <p className='text-xs'>{post.description} by {post.author.name}</p>
                </div>
                <img className='w-12 h-12 rounded-full' src={urlFor(post.author.image).url()!} alt="author image" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

//this is where SSR comes into play
export const getServerSideProps = async() => {
  const query = `*[ _type == "post"]{
    _id, 
    title, 
    description,
    author-> {
      name, 
      image
    }, 
    slug,
    mainImage, 
 }`;

 const posts = await sanityClient.fetch(query);

//returning props
 return {
   props:{
     posts,     
   }
 }
}
