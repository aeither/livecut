import React, { useEffect, useRef } from 'react'

const Navigation = () => {
  return (
    <div className="navbar bg-base-100 p-0">
      <div className="navbar-start pl-4">
        <div className="w-32">
          <img src="/images/livecut-logo-text-transparent.png" width="100%" alt="" />
        </div>
        {/* <a className="btn-ghost btn text-xl normal-case">Livecut</a> */}
      </div>
      <div className="navbar-center hidden lg:flex">
        <progress className="progress progress-success w-72"></progress>
      </div>
      <div className="navbar-end pr-4">
        <a className="btn">Connect</a>
      </div>
    </div>
  )
}

export default Navigation
