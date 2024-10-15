import { SmartCar } from "@/assets/icons/smartCar";
import { SmallCard } from "@/assets/icons/smartCard";
import color from "@/themes/app.colors";
import { Driving, Wallet } from "@/utils/IconsUtils";
import Images from "@/utils/ImagesUtils";

export const slides = [
  {
    id: 0,
    image: Images.destination,
    text: "Choose your destination",
    description: "First choose your destination where you want to go!",
  },
  {
    id: 1,
    image: Images.trip,
    text: "Wait for your driver",
    description: "Just wait for a while now until your driver is picking you!",
  },
  {
    id: 2,
    image: Images.bookRide,
    text: "enjoy your trip",
    description:
      "Now enjoy your trip, pay your driver after reaching the destination!",
  },
];

export const rideData = [
  { id: "1", totalEarning: "Rs 1200", title: "Total Earning" },
  { id: "2", totalEarning: "12", title: "Complete Ride" },
  { id: "3", totalEarning: "1", title: "Pending Ride" },
  { id: "4", totalEarning: "04", title: "Cancel Ride" },
];

export const rideIcons = [
  <Wallet colors={color.primary} />,
  <SmartCar />,
  <SmallCard color={color.primary} />,
  <Driving color={color.primary} />,
];

export const recentRidesData: recentRidesTypes[] = [
  {
    id: "1",
    user: "Shahriar Sajeeb",
    rating: "5",
    earning: "142",
    pickup: "Green line bus stand, Rajar Bag, Dhaka",
    dropoff: "Banani Road no 11, Block F, Dhaka",
    time: "14 July 01:34 pm",
    distance: "8km",
  },
];
