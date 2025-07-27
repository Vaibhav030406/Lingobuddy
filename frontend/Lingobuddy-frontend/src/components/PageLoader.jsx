import React from 'react'
import { LoaderIcon } from 'lucide-react'
const PageLoader = () => {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <LoaderIcon className="w-20 h-20 text-purple-500 animate-spin" />
    </div>
  )
}

export default PageLoader
