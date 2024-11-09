const app = angular.module("asm2", ["ngRoute"]);

app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "./particals/home.html",
        })
        .when("/abouts", {
            templateUrl: "./particals/about.html",
        })
        .when("/products", {
            templateUrl: "./particals/products.html",
            controller: "productsController"
        })
        .when("/products/:id", {
            templateUrl: "./particals/products_detail.html",
            controller: "productDetailController"
        })
        .when("/news", {
            templateUrl: "./particals/news.html",
        })
        .when("/contact", {
            templateUrl: "./particals/contact.html",
            controller: "contactController"
        })
        .otherwise({
            redirectTo: "/"
        });
});

app.controller("productsController", function ($scope, $http, $location) {
    $scope.showProductDetail = function (productId) {
        $location.path('/products/' + productId);
    };
});

app.controller('productDetailController', function ($scope, $http) {
    // Gọi API để lấy thông tin sản phẩm duy nhất
    $http({
        method: 'GET',
        url: 'http://localhost:3000/products'// URL này trả về một sản phẩm duy nhất
    }).then(function successCallback(response) {
        $scope.productId = response.data;
        console.log($scope.productId);
    }, function errorCallback(response) {
        console.error('Error fetching product details:', response);
    });

});

app.controller('RegisterController', function ($scope, $window, $timeout) {
    // Khởi tạo đối tượng để lưu thông tin đăng ký
    $scope.registerData = {
        fullName: '',
        username: '',
        password: '',
        email: '',
        phone: ''
    };

    // Hàm đăng ký
    $scope.register = function () {
        if ($scope.registerForm.$invalid) {
            $scope.showErrors = true;
            return;
        }

        // Lấy danh sách người dùng đã đăng ký từ localStorage
        var userData = JSON.parse(localStorage.getItem('userData')) || [];
        $scope.usernameExistsError = false;

        // Kiểm tra xem username đã tồn tại chưa
        var userExists = userData.some(user => user.username === $scope.registerData.username);
        if (userExists) {
            $scope.usernameExistsError = true; // Hiển thị thông báo lỗi
            return;
        }

        // Thêm thông tin đăng ký mới vào mảng
        userData.push($scope.registerData);

        // Lưu mảng mới vào localStorage
        localStorage.setItem('userData', JSON.stringify(userData));

        // Hiển thị thông báo đăng ký thành công
        toastr.success("Đăng ký thành công!");

        // Đóng modal đăng ký
        $('#registerModal').modal('hide');

        // Đặt lại dữ liệu form
        $scope.clearRegisterForm();

        // Reload trang sau một khoảng thời gian ngắn để đảm bảo toastr thông báo hiển thị
        $timeout(function () {
            $window.location.reload(); // Reload trang để hiện modal đăng nhập
        }, 1000); // Thời gian chờ 2 giây trước khi reload trang
    };

    // Hàm xóa dữ liệu trong form
    $scope.clearRegisterForm = function () {
        $scope.registerData = {
            fullName: '',
            username: '',
            password: '',
            email: '',
            phone: ''
        };
        $scope.showErrors = false;
    };
});

app.service('AuthService', function () {
    var userData = JSON.parse(localStorage.getItem('userData')) || [
        { username: 'user', password: 'password', fullName: 'User FullName', email: 'user@example.com', phone: '1234567890' }
    ];

    var isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn')) || false;
    var loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')) || null;

    function updateLocalStorage() {
        localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
    }

    return {
        login: function (username, password) {
            var user = userData.find(function (u) {
                return u.username === username && u.password === password;
            });

            if (user) {
                isLoggedIn = true;
                loggedInUser = user;
                updateLocalStorage();
                return { success: true, user: user };
            } else {
                return { success: false, message: "Tên đăng nhập hoặc mật khẩu không đúng." };
            }
        },
        logout: function () {
            isLoggedIn = false;
            loggedInUser = null;
            updateLocalStorage();
        },
        isLoggedIn: function () {
            return isLoggedIn;
        },
        getLoggedInUser: function () {
            return loggedInUser;
        }
    };
});

app.controller('headerController', ['$scope', 'AuthService', '$window', function ($scope, AuthService, $window) {
    $scope.togglePasswordVisibility = function(targetId) {
        var passwordInput = document.getElementById(targetId);
        var eyeIcon = document.querySelector('#' + targetId + ' + .toggle-password');

        if (passwordInput && eyeIcon) {
            var type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            if (type === 'text') {
                eyeIcon.classList.remove('bi-eye');
                eyeIcon.classList.add('bi-eye-slash');
            } else {
                eyeIcon.classList.remove('bi-eye-slash');
                eyeIcon.classList.add('bi-eye');
            }
        }
    };



    $scope.isLoggedIn = AuthService.isLoggedIn();
    $scope.loggedInUser = AuthService.getLoggedInUser();
    $scope.errorMessage = '';

    $scope.showLoginModal = function () {
        $scope.errorMessage = '';
        $scope.loginUser = '';
        $scope.loginPassword = '';
        $('#loginModal').modal('show');
    };

    $scope.login = function () {
        let username = $scope.loginUser;
        let password = $scope.loginPassword;

        var result = AuthService.login(username, password);
        if (result.success) {
            $scope.isLoggedIn = true;
            $scope.loggedInUser = result.user;
            $('#loginModal').modal('hide');
            toastr.success("Đăng nhập thành công!");
            $window.location.reload(); // Tải lại trang sau khi đăng nhập thành công
        } else {
            $scope.errorMessage = result.message;
            toastr.error(result.message);
        }
    };

    $scope.logout = function () {
        AuthService.logout();
        $scope.isLoggedIn = false;
        $scope.loggedInUser = null;
        toastr.success("Đăng xuất thành công!");
    };




  

}]);

window.onscroll = function () {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        scrollToTopBtn.style.display = 'block';
    } else {
        scrollToTopBtn.style.display = 'none';
    }
};

document.getElementById('scrollToTopBtn').addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
