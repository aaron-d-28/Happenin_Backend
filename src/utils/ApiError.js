class ApiError extends Error{
    constructor(
        statuscode,
        message="Something went wrong bruh",
        errors=[],
        stack=""
    )
    {
        super(message)
        this.statuscode=statuscode
        this.errors=errors,
        this.message=message,
        this.success=false,
        this.data=null
        if (stack)
        {
            this.stack=stack
        }
        else
        {
            Error.captureStackTrace(this,this.constructor)
        }
    }
}
export {ApiError}