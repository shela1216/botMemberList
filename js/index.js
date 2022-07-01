(function (window) {
    var ua = navigator.userAgent.toLowerCase() || navigator.vendor || window.opera;
    var data = {
        searchTxt: "",
        viewHeight: document.body.clientHeight,
        AllowLogIn: false,
        fixedOrderPanel: false,
        groupName: "",
        groupPass: "",
        passTrue: false,
        groupData: "",
        totalList: 0,
        workNum: "",
        groupId: "",
        params: params,
        workref: "",
        workList: [],
        ListData: [],
        HeadData: [],
        oldNameData: [],
        allWork: [],
        custom: [],
        currentIndex: 0,
        sortby: "gameWork"
    }
    var vm = new Vue({
        el: "#main",
        data: data,
        computed: {
            PageHeight: function () {
                return this.viewHeight - 147 + "px"
            },
            groupInfo: function () {
                return db.collection('loginGroup').doc(this.groupId)
            },
            windowInfo: function () {
                return this.oldNameData[this.currentIndex]
            },
            search_List: function () {
                if (this.searchTxt != "") {
                    var newList = [];
                    for (var i = 0; i < this.ListData.length; i++) {

                        if (this.ListData[i].gameUser.indexOf(this.searchTxt) != -1) {
                            newList.push(this.ListData[i])
                        } else if (this.ListData[i].gameWork.indexOf(this.searchTxt) != -1) {
                            newList.push(this.ListData[i])
                        } else if (this.ListData[i].userName.indexOf(this.searchTxt) != -1) {
                            newList.push(this.ListData[i])
                        }
                    }

                    return newList
                } else {
                    return this.ListData;
                }

            },
            headList: function () {
                return this.HeadData[0];
            },
            args: function () {
                var ret = {};
                var str = this.params;
                if (!str) {
                    return ret;
                }
                var seg = str.replace(/^\?/, "").split('&');

                for (var i = seg.length - 1; i >= 0; i--) {
                    if (!seg[i]) {
                        continue;
                    }
                    var s = seg[i].split('=');
                    ret[s[0]] = s[1];
                }

                return ret;
            }
        },
        mounted: function () {
            this.viewHeight = document.body.clientHeight;
            window.addEventListener('resize', this.heightChange);
            document.addEventListener('scroll', this.handleScroll);
        },
        created: function () {
            if (this.args.groupid) {
                this.groupId = this.args.groupid;
            } else {
                this.AllowLogIn = false;
                return
            }
            var self = this;
            var groupInfo = db.collection('loginGroup').doc(self.groupId);

            groupInfo.get().then(doc => {
                this.groupData = doc.data();
                var data = this.groupData;
                if (data.custom && data.custom.length > 0) {
                    this.custom = data.custom;
                }
                this.groupName = data.groupName;
                this.groupPass = data.groupPass;
                if (this.groupPass == this.args.groupPass) {
                    this.workNum = data.work;
                    var botWork = db.collection('gameWork').doc(this.workNum).collection('workList');
                    botWork.get().then(querySnapshot => {
                        querySnapshot.forEach(doc => {
                            self.workList.push({
                                'work': doc.data()['name'],
                                'total': 0 + ""
                            })
                        });
                        var list = db.collection('loginGroup').doc(this.groupId).collection('memberList');
                        if (list) {
                            this.AllowLogIn = true;
                            var data = list;
                            var ListData = this.ListData;
                            var headData = this.HeadData;

                            data.get().then(querySnapshot => {
                                querySnapshot.forEach(doc => {
                                    var newData = {
                                        gameUser: doc.data()['gameUser'],
                                        gameWork: doc.data()['gameWork'],
                                        userName: doc.data()['userName'],
                                        date: doc.data()['time']

                                    }
                                    var oldInfo = {
                                        gameUser: doc.data()['gameUser'],
                                        userName: doc.data()['userName'],
                                        history: []
                                    }
                                    if (doc.data()['oldID'] && doc.data()['oldID'].length > 0) {
                                        oldInfo.history = doc.data()['oldID']
                                    }
                                    this.oldNameData.push(oldInfo)
                                    if (this.custom) {
                                        for (var i = 0; i < this.custom.length; i++) {
                                            newData['custom' + i] = doc.data()['custom' + i] ? doc.data()['custom' + i] : ""
                                        }
                                    }
                                    if (doc.id != 'title') {
                                        ListData.push(newData);

                                    } else {
                                        for (var i = 0; i < this.custom.length; i++) {
                                            newData['custom' + i] = this.custom[i];
                                        }
                                        headData.push(newData);


                                    }
                                });
                                this.totalList = ListData.length;
                                this.sortListData();
                                var str = [];
                                ListData.map(item => {
                                    str.push(item['gameWork']);
                                });
                                for (var i = 0; i < self.workList.length; i++) {
                                    var total = self.collectionRepeat(str, self.workList[i]['work'])
                                    this.workList[i]['total'] = total + "";
                                }
                            });
                        } else { }

                    });

                } else {
                    this.AllowLogIn = false;
                }

            })


        },

        destroyed: function () {
            document.removeEventListener('scroll', this.handleScroll);
        },

        methods: {
            heightChange: function (event) {
                var screenHeight = document.body.clientHeight;
                this.viewHeight = screenHeight;
            },
            setUserInfo: function (item) {
                this.searchTxt = item.work;
            },
            collectionRepeat: function (box, key) {
                var counter = {};

                box.forEach(function (x) {
                    counter[x] = (counter[x] || 0) + 1;
                });

                var val = counter[key];

                if (key === undefined) {
                    return counter;
                }

                return (val) === undefined ? 0 : val;
            },
            sortListData: function () {
                ListData = this.ListData;
                sortBy = this.sortby;
                ListData.sort(function (a, b) {
                    var value1 = a[sortBy];
                    var value2 = b[sortBy];
                    if (value1 == value2) {
                        return a['userName'] > b['userName'] ? 1 : -1
                    } else {
                        return value1 > value2 ? 1 : -1
                    }
                })
            },
            changeSort: function (indexName) {
                if (this.ListData) {
                    this.sortby = indexName;
                    this.sortListData();
                }

            },
            haveOldData: function (index, tdindex) {
                if (this.headList[tdindex] == "遊戲ID" && this.oldNameData[index].history.length > 0) {
                    return true;
                } else {
                    return false;
                }

            },
            getOldInfo: function (index) {
                this.currentIndex = index;
            },
            download: function () {
                var newData = this.HeadData.concat(this.ListData);
                let csvContent = '';
                newData.forEach(function (rowArray) {
                    csvContent += rowArray.gameUser + ",";
                    csvContent += "\"" + rowArray.gameWork + "\",";
                    csvContent += "\"" + rowArray.userName + "\",";
                    csvContent += "\n";
                });

                // 下載的檔案名稱
                let fileName = this.groupName + ' 會員名單_' + (new Date()).getTime() + '.csv';

                // 建立一個 a，並點擊它
                let link = document.createElement('a');
                link.setAttribute('href', 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csvContent));
                link.setAttribute('download', fileName);
                link.click();
            }

        }
    })
})(window);