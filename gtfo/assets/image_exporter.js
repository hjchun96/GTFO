export function loadImages() {
	 const five_img = require("./images/5.png");
		const six_img = require("./images/6.png");
		floorplan_map = {
			"Towne" : five_img,
			"Moore" : six_img,
			"Levine" : five_img,
			"DRL" : six_img,
		}
		return floorplan_map;
}
