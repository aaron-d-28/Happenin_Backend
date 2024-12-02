// Exporting the asyncHandler function so it can be used in other modules
export const asyncHandler = (fn) => 
  // The async function returned here acts as a wrapper for any asynchronous route handler function (fn)
  async (req, res, next) => {
      try {
          // Await the passed function (fn) which takes req, res, and next as arguments.
          // This allows the async handler to execute the function and catch any errors that might occur.
          await fn(req, res, next);
        //   console.log("Aaron here the async handler works well")
      } catch (error) {
          // If an error occurs, handle it by sending a JSON response with the error code or defaulting to 500.
          // This keeps the server from crashing and provides a consistent error response structure.
          res.status(error.code || 500).json({
              success: false,                  // Flag indicating the operation did not succeed
              message: error.message,          // The actual error message
              "p.s": "WE here in asynchandler.js", // Additional note to indicate where the error was handled
          });
      }
  };
