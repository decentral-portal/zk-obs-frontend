import { useRouter } from "next/router";
import DepositCard from "../../components/DepositCard";
import Faucet from "../../components/Faucet";
import Profile from "../../components/Profile";
import WithdrawCard from "../../components/WithdrawCard";
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
	H1: {
		fontSize: "1.5rem",
		fontWeight: "bold" as const,
		width: "60%",
		margin: "2rem 0 1rem 0",
	},
};

const ProfilePage = () => {
	const router = useRouter();

	return (
		<>
			<Header />
			<div style={STYLES.SECTION}>
				<Banner />
				<h1 style={STYLES.H1}>Profile</h1>
				<Profile />
				<h1 style={STYLES.H1}>Deposit/Withdraw</h1>
				<DepositCard />
				<WithdrawCard />
				<h1 style={STYLES.H1}>Faucet</h1>
				<Faucet />
			</div>
		</>
	);
};

export default ProfilePage;
