import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const LoginForm = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [datax, setdatax] = useState<{ data: string, user: string[] }>({ data: "", user: [] });

    let data;
    const router = useRouter();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(username, password);
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({

                    username: username,
                    password: password
                }),
            });
            data = await response.json();
            setdatax(data);
        } catch (error) {
            console.error("Error saving proof:", error);
            alert("❌ Something went wrong.");
        }

    };
    useEffect(() => {
        console.log("Token state changed:", datax);
        if (datax.data) {
            console.log("Token received:", datax.data);
            localStorage.setItem("token", datax.data);
            localStorage.setItem("user", JSON.stringify(datax.user));
            router.push("/components/Home");
        }
    }, [datax]);



    return (
        <div className="min-h-screen bg-gray-100 dark:bg-black flex flex-col items-center justify-center gap-10">

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back!</h1>
            <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md w-full max-w-md mx-auto">
                <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-white">Login</h2>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                >
                    Login
                </button>
                <button
                    type="button"
                    onClick={() => router.push("Register")}
                    className="w-full text-sm text-blue-600 dark:text-blue-400 mt-2 hover:underline"
                >
                    Don't have an account? Register
                </button>
            </form>
        </div>
    );
};

export default LoginForm;