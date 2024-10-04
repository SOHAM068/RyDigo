import jwt from "jsonwebtoken";

//send Token
export const sendToken = async (user: any, res: any) => {
    const accessToken = jwt.sign(
        { id: user.id },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "7d" }
    );
    console.log("accessToken : ", accessToken);

    res.status(200).json({
        success: true,
        message: "User logged in successfully",
        accessToken,
        user,
    })
}