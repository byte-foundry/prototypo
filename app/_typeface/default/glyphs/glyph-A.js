points[0](0,0);
points[1](width * 400, 0);
points[2](points[1].x / 2, xHeight);
points[3](10,20);

skeletons[0](
	{c: points[0], width: thickness * contrast},
	{c: points[2], width: thickness * contrast * 0.8, angle: -90, distr: 0, rType: 'explicit', rc: [0,0]},
	{c: points[1], width: thickness * contrast, angle: -180, lType: 'explicit', lc: [0,0]}
);