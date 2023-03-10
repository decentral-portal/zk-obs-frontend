import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/router";
import Link from "next/link";
import { Image } from "@chakra-ui/react";
import iconImg from "../assets/icon.png";
import { UrlObject } from "url";

declare type Url = string | UrlObject;

const STYLES = {
	HEADER: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "gray",
		padding: "0 30px",
		height: "80px",
		width: "100%",
	},
	LOGOBOX: {
		display: "flex",
		flexDirection: "row" as const,
		alignItems: "center",
	},
	TITLE: {
		fontSize: "36px",
		fontWeight: "bold",
		color: "white",
	},
	BOX: {
		display: "flex",
		alignItems: "center",
	},
	SELECTOR: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
	},
	BTN: {
		fontSize: "18px",
		fontWeight: "bold",
		color: "white",
		margin: "0 10px",
		padding: "10px 20px",
		borderRadius: "10px",
		cursor: "pointer",
	},
};

export default function Header() {
	return (
		<div style={STYLES.HEADER}>
			<div style={STYLES.LOGOBOX}>
				<Image src={iconImg.src} boxSize="85px" alt="icon" p={4} />
				<div style={STYLES.TITLE}>ZK-OBS</div>
			</div>
			<div style={STYLES.BOX}>
				<div style={STYLES.SELECTOR}>
					<Link href={"/" as Url}>
						<div style={STYLES.BTN}>Trade</div>
					</Link>
					<Link href={"/profile" as Url}>
						<div style={STYLES.BTN}>Profile</div>
					</Link>
				</div>
				<ConnectButton />
			</div>
		</div>
	);
}
