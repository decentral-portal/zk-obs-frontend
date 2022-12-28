import { useRouter } from "next/router";
import Profile from "../../components/Profile/Profile";
import Header from "../../components/Header";
import Banner from "../../components/Banner";

const STYLES = {
	SECTION: {
		display: "flex",
		flexDirection: "column" as const,
		alignItems: "center",
		justifyContent: "center",
		margin: "1rem auto",
		width: "80%",
		padding: "1rem",
	},
	CONTAINER: {
		width: "100%",
	},
};

const ProfilePage = () => {
	const router = useRouter();

	return (
		<>
			<Header />
			<div style={STYLES.SECTION}>
				<Banner />
				<div style={STYLES.CONTAINER}>
					<Profile />
				</div>
			</div>
		</>
	);
};

export default ProfilePage;
