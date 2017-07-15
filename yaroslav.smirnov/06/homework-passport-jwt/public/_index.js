$(document).ready(function() {

    if (window.sessionStorage.getItem('token')) {
        xhr.setRequestHeader("Authorization", window.sessionStorage.getItem('token'));
    }

    sessionStorage.setItem('something', 'really great');


    var pathname = window.location.pathname;

    var form;

    switch (pathname) {
        case '/register':
            form = '#register';
            break;
        case '/login':
            form = '#login';
            break;
        default:
            form = '#register';
    }

    $(form).on('submit', function(e) {
        e.preventDefault();
        if (validator.isEmail(e.target.email.value)) {

            var userCredentials = {
                email: e.target.email.value,
                password: e.target.password.value
            };

            if (pathname == '/register' && e.target.displayName.value) {
                userCredentials.displayName = e.target.displayName.value;
            }

            // var requestOptions = {
            //     url: pathname,
            //     method: 'POST',
            //     // accepts: 'application/json',
            //     data: userCredentials,
            //     dataType: 'json'
            // };

            // requestOptions.headers['X-CSRF-Token'] = e.target._csrf.value;

            // var token = sessionStorage.getItem('token');
            // if (token) {
            //     requestOptions.headers['Authorization'] = token;
            // }

            console.log(userCredentials);
            // console.log(requestOptions);
            
            $.ajax({
                url: pathname,
                method: 'POST',
                headers: {
                    'X-CSRF-Token': e.target._csrf.value,
                },
                // accepts: 'application/json',
                data: userCredentials,
                dataType: 'json',
                success: function(data, status, res) {
                    switch(pathname) {
                        case '/register':
                            console.log('redirect to /login after /register');
                            window.location.pathname = '/login';
                            break;
                        default:
                            if (data) {
                                console.log(data);
                                sessionStorage.setItem('token', data.token);
                                var xhr = new XMLHttpRequest();
                                xhr.setRequestHeader("Authorization", window.sessionStorage.getItem('token'));
                                window.location.pathname = '/';
                            }
                            break;
                    }
                }
            });



            // $.ajax(requestOptions)
            //     .done(function(data) {
            //         switch(pathname) {
            //             case '/register':
            //                 console.log('redirect to /login after /register');
            //                 window.location.pathname = '/login';
            //                 break;
            //             case '/login':
            //                 if (data) {
            //                     console.log(data);
            //                     sessionStorage.setItem('token', data.token);
            //                     xhr.setRequestHeader("Authorization", window.sessionStorage.getItem('token'));
            //                     window.location.pathname = '/';
            //                 }
            //                 break;
            //             default:
            //                 console.log(data);
            //                 window.location.pathname = '/';
            //         }

            //     });

            
        } else {
            $('#email').css('border', '2px solid red');
            $('#login-flash').removeClass('hidden');
            $('#login-flash').text('Please enter a valid email address.');
        }
        console.log(e.target.email.value);
    });
});