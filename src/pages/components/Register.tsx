import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const RegisterForm = () => {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [datax, setdatax] = useState<{ data: string, user: string[] }>({ data: "", user: [] });
    let data;
    const router = useRouter();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        console.log(username, password);

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name,
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
            router.push("Home");
        }
    }, [datax]);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-black flex flex-col items-center justify-center gap-10">

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Join Us!</h1>
            <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md w-full max-w-md mx-auto">
                <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-white">Register</h2>
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                />
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
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                >
                    Register
                </button>
                <button
                    type="button"
                    onClick={() => router.push("Login")}
                    className="w-full text-sm text-blue-600 dark:text-blue-400 mt-2 hover:underline"
                >
                    Already have an account? Login
                </button>
            </form>
        </div>
    );
};

export default RegisterForm;