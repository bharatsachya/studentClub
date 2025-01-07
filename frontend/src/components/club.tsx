import { useState } from "react"
function Club() {
  const [] = useState()
  const handleSubmit = (e:any) => {
    e.preventDefault()
  }
  return (
    <>
       <form onSubmit={handleSubmit}>
          <label htmlFor="">Name of Club</label>
       </form>
    </>
  )
}

export default Club