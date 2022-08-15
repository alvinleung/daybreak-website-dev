//@ts-check
//@ts-ignore
daybreak.router.useScript(()=>{
	console.log("enter home");

	//@ts-ignore
	const daybreak = window.daybreak;
	const {createGridTemplate, createInfiniteGrid, shuffleGridData} = daybreak.grid;

	const CELL_EMPTY = "empty";
	const CELL_PROJECT = "project";

	// alias for project and empty cells
	const _ = CELL_EMPTY;
	const X = CELL_PROJECT;

	const gridTemplates = [
		createGridTemplate([
			[_, X, _, X, X, _, _, X],
			[X, _, X, _, _, _, X, _],
			[_, X, _, _, X, _, X, _],
			[X, _, X, _, X, X, _, X],
			[_, _, _, X, _, _, X, _],
			[X, _, X, _, X, _, _, X],
			[_, X, _, X, _, _, X, _],
			[X, _, _, _, X, _, _, X],
			[X, _, X, _, _, X, _, _],
		]),
		createGridTemplate([
			[X, _, _, X, X, _, _, X],
			[_, _, X, _, _, _, X, _],
			[_, X, _, _, X, _, X, _],
			[X, _, X, _, X, X, _, X],
			[_, _, _, X, _, _, X, _],
			[X, _, X, _, _, _, _, X],
			[_, X, _, X, _, _, X, _],
			[X, _, _, _, X, _, _, X],
			[X, _, X, _, _, X, _, _],
		]),
	]

	const gridContainer = document.createElement("div");
	document.body.appendChild(gridContainer);

	const projectDataFromHTML = readProjectDataFromHTML();

  // data with multiple images
  const cellData = projectDataFromHTML.reduce((arr, currProject) => {
    currProject.cover.forEach((coverImageUrl) => {
      arr.push({
        // @ts-ignore
        ...currProject, cover: coverImageUrl
      })
    })

    return arr;
  }, [])

	const cellDataShuffled = shuffleGridData(cellData.reduce((arr, curr) => {
    arr.push({ importance: curr.importance, data: curr });
    return arr
  }, []));

	const cleanupInfiniteGrid = createInfiniteGrid({
		cols: 8,
		templates: gridTemplates,
		baseElm: gridContainer,
		renderCell: (cellInfo) => {
			if (cellInfo.type === CELL_EMPTY) {
				return;
			}
			const cellData = cellDataShuffled.next();
			const projectLink = document.createElement("a");
			projectLink.href = cellData.href;

			const projectImage = document.createElement("img");
			projectImage.style.pointerEvents = "none"; // disable for microsoft edge
			projectImage.src = cellData.cover;

			projectLink.appendChild(projectImage);
			cellInfo.elm.appendChild(projectLink);

			// cleanup cell
			return () => {
				projectLink.removeChild(projectImage);
				cellInfo.elm.removeChild(projectImage);
			}
		}
	});

	// cleanup function
	return ()=>{
		cleanupInfiniteGrid();
	}
})


function readProjectDataFromHTML() {
	const baseElm = document.querySelector(".all-daybreak-projects");
  const allProjects = baseElm?.querySelectorAll(".daybreak-project");
	//@ts-ignore
  const projectData = Array.from(allProjects).map((projectElm) => {
		//@ts-ignore
    const href = projectElm.href;
    const importanceElm = projectElm.querySelector(".daybreak-project-importance");
    const nameElm = projectElm.querySelector(".daybreak-project-name");
    const descriptionElm = projectElm.querySelector(".daybreak-project-description");
    const yearElm = projectElm.querySelector(".daybreak-project-year");
    const expertiseElm = projectElm.querySelector(".daybreak-project-expertise");
    const coverElm = projectElm.querySelector(".daybreak-project-cover");

		if(!importanceElm || !nameElm ||!descriptionElm||!yearElm||!expertiseElm||!coverElm) {
			throw "invalid element"
		}

    const importance = parseInt(importanceElm.innerHTML);
    const name = nameElm.innerHTML;
    const description = descriptionElm.innerHTML;
    const year = yearElm.innerHTML;
    const expertise = expertiseElm.innerHTML.split(",").map((str) => str.trim());
		//@ts-ignore
    const cover = Array.from(coverElm.children).map((elm) => (elm).src);

    return {
      importance, name, description, year, expertise, cover,href
    }
  })

  return projectData;
}

function onFullyLoaded(callback) {
	let aborted = false;
	const abort = ()=> {
		aborted = true;
	};
	const invoke = ()=> {
		callback();
	}
	
	if (document.readyState !== "complete") {
		window.addEventListener("load", () => {
			if(!aborted) 
				invoke()
		});
	} else {
		//invoke right if body is loaded
		invoke();
	}

	return abort;
}
