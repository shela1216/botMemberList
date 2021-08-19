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
        allWork: []
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
                this.groupName = data.groupName;
                this.groupPass = data.groupPass;
                if (this.groupPass == this.args.groupPass) {
                    this.workNum = data.work;
                    var botWork = db.collection('gameWork').doc(this.workNum).collection('workList');
                    botWork.get().then(querySnapshot => {
                        querySnapshot.forEach(doc => {
                            self.workList.push({
                                'work':doc.data()['name'],
                                'total':0+""
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
                                    if (doc.id != 'title') {
                                        ListData.push(doc.data());

                                    } else {
                                        headData.push(doc.data());
                                    }
                                });
                                this.totalList = ListData.length;
                                ListData.sort(function (a, b) {
                                    var value1 = a['gameWork'];
                                    var value2 = b['gameWork'];
                                    if (value1 == value2) {
                                        return a['userName'] > b['userName'] ? 1 : -1
                                    } else {
                                        return value1 > value2 ? 1 : -1
                                    }
                                })
                                var str = [];
                                ListData.map(item => {
                                    str.push(item['gameWork']);
                                });
                                for (var i = 0; i < self.workList.length; i++) {
                                    var total = self.collectionRepeat(str, self.workList[i]['work'])
                                    this.workList[i]['total']=total+"";
                                }
                            });
                        } else {
                        }

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
            handleScroll: function () {
                const checkWindow = window !== undefined && window.scrollY;

                if (checkWindow && window.scrollY > 144) {
                    this.fixedOrderPanel = true
                } else {
                    this.fixedOrderPanel = false
                }

                const scrollFix = (scrolled) => {
                    if (scrolled > 144) {

                        this.fixedOrderPanel = true
                    } else {
                        this.fixedOrderPanel = false
                    }
                }
            },
            setUserInfo: function (item) {
                this.searchTxt = item;
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
            }
        }
    })
})(window);