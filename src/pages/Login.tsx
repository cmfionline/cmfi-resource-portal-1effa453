import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function Login() {
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error("Error checking session:", error)
        toast({
          title: "Error checking session",
          description: "Please try again later",
          variant: "destructive",
        })
        return
      }

      if (session) {
        try {
          navigate(-1)
        } catch {
          navigate("/admin")
        }
      } else {
        // For Lovable console users, sign in with console user credentials
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: "console-user@lovable.dev",
          password: "console-user",
        })

        if (signInError) {
          // If sign in fails, try creating the console user first
          const { error: signUpError } = await supabase.auth.signUp({
            email: "console-user@lovable.dev",
            password: "console-user",
            options: {
              data: {
                role: 'admin' // Set admin role in metadata
              }
            }
          })

          if (signUpError) {
            console.error("Error signing up:", signUpError)
            toast({
              title: "Error signing up",
              description: signUpError.message,
              variant: "destructive",
            })
            return
          }

          // Try signing in again after creating the user
          const { error: retryError } = await supabase.auth.signInWithPassword({
            email: "console-user@lovable.dev",
            password: "console-user",
          })

          if (retryError) {
            console.error("Error signing in:", retryError)
            toast({
              title: "Error signing in",
              description: retryError.message,
              variant: "destructive",
            })
            return
          }
        }

        try {
          navigate(-1)
        } catch {
          navigate("/admin")
        }
      }
    }

    checkSession()
  }, [navigate, toast])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Signing you in...</h1>
        <p className="text-gray-600">Please wait while we authenticate you.</p>
      </div>
    </div>
  )
}