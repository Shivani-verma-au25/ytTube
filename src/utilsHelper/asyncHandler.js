const asyncHandeler = (requestHandler) =>{
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((e) => (e) => next(e))
    }
}

export {asyncHandeler}