import Sidebar from './Sidebar';
import Navbar from './Navbar';


const Layout = ({children,showSidebar = false}) => {
  return (
    <div className="min-h-screen">
      <div className='flex'>
        {showSidebar && <Sidebar/>}
      </div>
    <div className='flex-1 flex flex-col'>
        <Navbar/>
    </div>
    <main>
        {children}
    </main>
    </div>
  )
}

export default Layout

