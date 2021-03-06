// DECLARE VARIABLE TO CHOOSE ENDPOINT
const url = document.title.includes('Senators') ? 'senate' : 'house'

// DECLARE VARIABLE TO USE API KEY
let init = { headers: { 'X-API-Key': '7IBdtYXOoDf6A5WjVIpTLkZIdUOvTB4gJ4BqmjJL' } }

// FETCHING API
if (document.title !== 'Transparent Government In Fact') {
    fetch(`https://api.propublica.org/congress/v1/113/${url}/members.json`, init)
        .then(res => res.json())
        .then(json => {
            let data = [...json.results[0].members]
            myApp(data)
        })
        .catch(err => {
            document.getElementById('preloader').classList.add('d-none')
            document.getElementById('main').innerHTML = `
        <h1 class="text-center">OOPS!</h1>
        <div class="row">
            <div class="d-flex justify-content-center align-items-center">
                <img src="../assets/unplug.png" alt="unplug icon" class="errImg">
                <div>
                    <h2>We're so sorry</h2>
                    <p> We're having some problems to show information</p>
                    <div class="d-flex flex-column">
                        <form method="get" action="" class="d-flex flex-column">
                            <label for="emal">Please enter your email and we'll let you know as soon as we solve situation</label>
                            <input type="email" id="email" name="email">
                            <input type="submit" value="Notify Me!">
                        </form>
                    </div
                </div>
            </div>
        </div>`
        })
} else {
    myApp([])
}


// MAIN APPLICATION
function myApp(data) {

    // CODE TO EXECUTE ONLY IN HOME PAGE
    if (document.title == 'Transparent Government In Fact') {
        document.getElementById('rm-button').addEventListener('click', function (e) {
            this.innerText = this.innerText == 'Read More' ? 'View Less' : 'Read More'
        })
    } else {
        // CREATING A COPY OF DATA TO USE IT IN ALL TABLES
        let members = JSON.parse(JSON.stringify(data))

        if (document.getElementById('houseData') || document.getElementById('senateData')) {

            let table = document.getElementById('houseData') ? document.getElementById('houseData') : document.getElementById('senateData')

            var stateFilter = 'all'
            var membersToShow = []

            // FUNCTION TO DEFINE FILTERS BEFORE RENDERING THE TABLE
            function readFilters() {
                membersToShow = stateFilter == 'all' ? members : membersToShow = members.filter(member => member.state == stateFilter)
                membersToShow = membersToShow.filter(member => partyFilter.includes(member.party))
            }

            // DEFINING FUNCTION TO RENDER THE TABLE
            function showData() {
                table.innerHTML = ''
                readFilters()
                membersToShow.forEach(member => {
                    let memberData = [`${member.last_name} ${member.first_name} ${member.middle_name || ''}`, member.party, member.state, member.seniority, `${member.votes_with_party_pct.toFixed(2)} %`]
                    let newRow = document.createElement('tr')
                    memberData.forEach((information) => {
                        let tableData = document.createElement('td')
                        tableData.classList.add('fs-6')
                        if (information == memberData[0]) {
                            let anchor = document.createElement('a')
                            anchor.href = member.url
                            anchor.target = '_blank'
                            anchor.innerText = information
                            tableData.appendChild(anchor)
                        } else {
                            tableData.innerText = information
                        }
                        newRow.appendChild(tableData)
                    })
                    table.appendChild(newRow)
                })
                document.getElementById('results').innerText = `Showing ${membersToShow.length} of ${members.length} entries`
                document.getElementById('preloader').classList.add('d-none')
                if (membersToShow.length == 0) {
                    table.innerHTML = `
                    <tr><td colspan="5">NO RESULTS. PLEASE SELECT A PARTY.</td></tr>`
                }
            }

            // CREATING  TWO ARRAYS. ONE THAT INCLUDES ALL STATES AND THE SECOND THAT INCLUDES ALL PARTIES (BOTH NON REPEATED)
            var partyFilter = []
            let nonRepeatedStates = []

            members.forEach(member => {
                if (!nonRepeatedStates.includes(member.state)) {
                    nonRepeatedStates.push(member.state)
                }
                if (!partyFilter.includes(member.party)) {
                    partyFilter.push(member.party)
                }
            })

            // ADDING THE PREVIOUS STATES AS "OPTION" OF "SELECT"
            let select = document.getElementById('states')
            nonRepeatedStates.sort().forEach(state => {
                let option = document.createElement('option')
                option.classList.add('fs-6')
                option.value = state
                option.innerText = state
                select.appendChild(option)
            })

            // RUNNING FUNCTION TO RENDER TABLE WHEN PAGE LOADS THE FIRST TIME
            showData()


            // EVENT LISTENER FOR SELECT ELEMENT
            select.addEventListener('change', function (e) {
                stateFilter = this.value
                showData()
            })

            // EVENT LISTENER FOR INPUTS TYPE CHECKBOX
            Array.from(document.getElementsByName('party')).forEach(input => {
                input.addEventListener('change', function (e) {
                    partyFilter.includes(this.value)
                        ? partyFilter = partyFilter.filter(party => party !== this.value)
                        : partyFilter.push(this.value)
                    showData()
                })
            })
        } else {
            // ARRAY WITHOUT MEMBERS WITH "TOTAL_VOTES=0"
            let nonZeroMembers = members.filter(member => member.total_votes > 0)
            // ORDERER MEMBERS BY MISSED VOTES
            let orderedMembers = JSON.parse(JSON.stringify(nonZeroMembers)).sort((a, b) => a.missed_votes_pct - b.missed_votes_pct) //ordenador de menor a mayor
            let breakpoint = orderedMembers[Math.ceil(members.length * 0.1) - 1].missed_votes_pct

            let orderedMembers2 = JSON.parse(JSON.stringify(nonZeroMembers)).sort((a, b) => b.missed_votes_pct - a.missed_votes_pct) //ordenador de mayor a menor
            let breakpoint2 = orderedMembers2[Math.ceil(members.length * 0.1) - 1].missed_votes_pct

            // ORDERER MEMBERS BY VOTES WITH PARTY
            let orderedMembers3 = JSON.parse(JSON.stringify(nonZeroMembers)).sort((a, b) => a.votes_with_party_pct - b.votes_with_party_pct) //ordenador de menor a mayor
            let breakpoint3 = orderedMembers3[Math.ceil(members.length * 0.1) - 1].votes_with_party_pct

            let orderedMembers4 = JSON.parse(JSON.stringify(nonZeroMembers)).sort((a, b) => b.votes_with_party_pct - a.votes_with_party_pct) //ordenador de mayor a menor
            let breakpoint4 = orderedMembers4[Math.ceil(members.length * 0.1) - 1].votes_with_party_pct

            // DEFINING EMPTY STATISTICS OBJECT
            const statistics = {}
            // FILLING IN "STATISTICS" OBJECT
            // GET NUMBER OF MEMBER PER EACH PARTY
            statistics.numOfDem = getNumberPerParty(members, 'D')
            statistics.numOfRep = getNumberPerParty(members, 'R')
            statistics.numOfInd = getNumberPerParty(members, 'ID')
            statistics.totalReps = members.length


            // GET THE AVERAGE OF "MISSED VOTES PERCENTAGE" FOR EACH PARTY
            statistics.missedVotesDem = reduceValueForParty(nonZeroMembers, 'D', 'missed_votes_pct', 'numOfDem')
            statistics.missedVotesRep = reduceValueForParty(nonZeroMembers, 'R', 'missed_votes_pct', 'numOfRep')
            statistics.missedVotesInd = reduceValueForParty(nonZeroMembers, 'ID', 'missed_votes_pct', 'numOfInd')
            // GET NEWS ARRAY THAT ONLY INCLUDES TOP 10% AND BOTTOM 10% ENGAGED
            statistics.mostEngaged = orderedMembers.filter(member => member.missed_votes_pct <= breakpoint)
            statistics.leastEngaged = orderedMembers2.filter(member => member.missed_votes_pct >= breakpoint2)


            // GET THE AVERAGE OF "VOTES WITH PARTY PERCENTAGE" FOR EACH PARTY
            statistics.votesWithPartyDem = reduceValueForParty(nonZeroMembers, 'D', 'votes_with_party_pct', 'numOfDem')
            statistics.votesWithPartyRep = reduceValueForParty(nonZeroMembers, 'R', 'votes_with_party_pct', 'numOfRep')
            statistics.votesWithPartyInd = reduceValueForParty(nonZeroMembers, 'ID', 'votes_with_party_pct', 'numOfInd')
            // GET NEWS ARRAY THAT ONLY INCLUDES TOP 10% AND BOTTOM 10% LOYALTY
            statistics.leastLoyal = orderedMembers3.filter(member => member.votes_with_party_pct <= breakpoint3)
            statistics.mostLoyal = orderedMembers4.filter(member => member.votes_with_party_pct >= breakpoint4)

            // DEFINING DATA TO SHOW
            let glanceData, leastData, mostData, property
            let glanceTable, leastTable, mostTable
            if (document.title.includes('Attendance')) {
                glanceData = [
                    {
                        name: "Democrats",
                        qty: statistics.numOfDem,
                        percentage: statistics.missedVotesDem
                    },
                    {
                        name: "Republicans",
                        qty: statistics.numOfRep,
                        percentage: statistics.missedVotesRep
                    },
                    {
                        name: "Independants",
                        qty: statistics.numOfInd,
                        percentage: `${isNaN(parseInt(statistics.missedVotesInd)) ? '-' : statistics.missedVotesInd}`
                    },
                    {
                        name: "Total",
                        qty: statistics.totalReps,
                        percentage: '-'
                    }
                ]
                leastData = statistics.leastEngaged
                mostData = statistics.mostEngaged
                glanceTable = document.getElementById('glance')
                leastTable = document.getElementById('leastEngaged')
                mostTable = document.getElementById('mostEngaged')
                property = 'missed'
            } else {
                glanceData = [
                    {
                        name: "Democrats",
                        qty: statistics.numOfDem,
                        percentage: statistics.votesWithPartyDem
                    },
                    {
                        name: "Republicans",
                        qty: statistics.numOfRep,
                        percentage: statistics.votesWithPartyRep
                    },
                    {
                        name: "Independants",
                        qty: statistics.numOfInd,
                        percentage: '-'
                    },
                    {
                        name: "Total",
                        qty: statistics.totalReps,
                        percentage: '-'
                    }
                ]
                leastData = statistics.leastLoyal
                mostData = statistics.mostLoyal
                glanceTable = document.getElementById('glanceLoyalty')
                leastTable = document.getElementById('leastLoyal')
                mostTable = document.getElementById('mostLoyal')
                property = 'withParty'
            }

            // FUNCTION TO COUNTS MEMBERS OF AN ARRAY WHO BELONGS TO EACH PARTY
            function getNumberPerParty(members, party) {
                return members.filter(member => member.party == party).length
            }
            // GET THE AVERAGE OF A PROPERTY OF ALL MEMBERS OF A PARTY
            function reduceValueForParty(members, party, property, membersQty) {
                let propertySumation = members.reduce((total, member) => {
                    let iterator = member.party == party ? member[property] : 0
                    return total + iterator
                }, 0)
                return `${(propertySumation / statistics[membersQty]).toFixed(2)} %`
            }

            function renderTable(information, father) {
                information.forEach(data => {
                    var newRow = document.createElement('tr')
                    for (const property in data) {
                        let newCell = document.createElement('td')
                        newCell.classList.add('fs-6')
                        newCell.innerText = data[property]
                        newRow.appendChild(newCell)
                    }
                    father.appendChild(newRow)
                })
                let preloader = document.getElementById('preloader')
                preloader.classList.add('d-none')
            }

            function renderBigTables(information, father, property) {
                information.forEach(data => {
                    var newRow = document.createElement('tr')
                    let newCell = document.createElement('td')
                    newCell.classList.add('fs-6')
                    newCell.innerHTML = `<a href="${data.url}" target="_blank">${data.last_name} ${data.first_name} ${data.middle_name || ""}</a>`
                    newRow.appendChild(newCell)
                    let newCell2 = document.createElement('td')
                    let newCell3 = document.createElement('td')
                    newCell2.classList.add('fs-6')
                    newCell3.classList.add('fs-6')
                    if (property == "missed") {
                        newCell2.innerText = data.missed_votes
                        newCell3.innerText = `${(data.missed_votes_pct).toFixed(2)} %`
                    } else {
                        newCell2.innerText = `${Math.ceil((data.total_votes - data.missed_votes) * data.votes_with_party_pct / 100)}`
                        newCell3.innerText = `${data.votes_with_party_pct.toFixed(2)} %`
                    }
                    newRow.appendChild(newCell2)
                    newRow.appendChild(newCell3)
                    father.appendChild(newRow)
                })
                let preloader = document.getElementById('preloader')
                preloader.classList.add('d-none')
            }

            renderTable(glanceData, glanceTable)
            renderBigTables(leastData, leastTable, property)
            renderBigTables(mostData, mostTable, property)
        }
    }

    let elements = []
    let wantedTags = ['p', 'a', 'option', 'label', 'caption', 'th', 'td', 'select']
    wantedTags.forEach(tag => {
        elements.push(Array.from(document.getElementsByTagName(tag)))
    })

    // EVENT LISTENER TO INCREASE FONT SIZE
    document.getElementById('more').addEventListener('click', (e) => {
        elements.forEach(element => {
            element.forEach(tag => {
                if (tag.classList.contains('fs-6')) {
                    tag.classList.remove('fs-6')
                    tag.classList.add('fs-5')
                } else if (tag.classList.contains('fs-5')) {
                    tag.classList.remove('fs-5')
                    tag.classList.add('fs-4')
                } else if (tag.classList.contains('fs-4')) {
                    tag.classList.remove('fs-4')
                    tag.classList.add('fs-3')
                }
            })
        })
    })

    // EVENT LISTENER TO DECREASE FONT SIZE
    document.getElementById('less').addEventListener('click', (e) => {
        elements.forEach(element => {
            element.forEach(tag => {
                if (tag.classList.contains('fs-3')) {
                    tag.classList.remove('fs-3')
                    tag.classList.add("fs-4")
                } else if (tag.classList.contains('fs-4')) {
                    tag.classList.remove('fs-4')
                    tag.classList.add("fs-5")
                } else if (tag.classList.contains('fs-5')) {
                    tag.classList.remove('fs-5')
                    tag.classList.add('fs-6')
                }
            })
        })
    })

    // EVENT LISTENER TO CHANGE BETWEEN DARK MODE AND NORMAL MODE
    let entireBody = document.getElementById('body')
    let allElements = Array.from(document.querySelectorAll('body *'))
    document.getElementById('mode').addEventListener('click', function (e) {
        if (localStorage.getItem('mode') == 'default') {
            document.title == 'Transparent Government In Fact' ? this.setAttribute('src', './assets/sun.png') : this.setAttribute('src', '../assets/sun.png')
            localStorage.setItem('mode', 'dark')
            entireBody.classList.add('bg-dark')
            allElements.forEach(element => {
                element.classList.add('bg-dark', 'text-white')
            })
        } else {
            document.title == 'Transparent Government In Fact' ? this.setAttribute('src', './assets/moon.png') : this.setAttribute('src', '../assets/moon.png')
            localStorage.setItem('mode', 'default')
            entireBody.classList.remove('bg-dark')
            allElements.forEach(element => {
                element.classList.remove('bg-dark', 'text-white')
            })
        }
    })

    let modeIcon = document.getElementById('mode')
    if (localStorage.getItem('mode') == 'default' || !localStorage.getItem('mode')) {
        localStorage.setItem('mode', 'default')
        document.title == 'Transparent Government In Fact' ? modeIcon.setAttribute('src', './assets/moon.png') : modeIcon.setAttribute('src', '../assets/moon.png')
        entireBody.classList.remove('bg-dark')
        allElements.forEach(element => {
            element.classList.remove('bg-dark', 'text-white')
        })
    } else {
        document.title == 'Transparent Government In Fact' ? modeIcon.setAttribute('src', './assets/sun.png') : modeIcon.setAttribute('src', '../assets/sun.png')
        entireBody.classList.add('bg-dark')
        allElements.forEach(element => {
            element.classList.add('bg-dark', 'text-white')
        })
    }
}