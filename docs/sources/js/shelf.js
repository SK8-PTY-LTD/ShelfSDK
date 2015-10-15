(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//================================================================================
// Shelf is a utility class for apps empowered for Shelf
// Author: Xujie Song
// Copyright: SK8 PTY LTD
// V0.9.6
//================================================================================

"use strict";

var SH = function() {}

var AV = function() {}

require('./src/SH.js')(SH, AV);
require('./src/SHError.js')(SH, AV);
require('./src/SHAddress.js')(SH, AV);
require('./src/SHCategory.js')(SH, AV);
require('./src/SHComment.js')(SH, AV);
require('./src/SHMembership.js')(SH, AV);
require('./src/SHPage.js')(SH, AV);
require('./src/SHProduct.js')(SH, AV);
require('./src/SHPurchase.js')(SH, AV);
require('./src/SHPurchaseEntry.js')(SH, AV);
require('./src/SHShop.js')(SH, AV);
require('./src/SHUser.js')(SH, AV);
require('./src/SHTransaction.js')(SH, AV);

module.exports = SH;
},{"./src/SH.js":2,"./src/SHAddress.js":3,"./src/SHCategory.js":4,"./src/SHComment.js":5,"./src/SHError.js":6,"./src/SHMembership.js":7,"./src/SHPage.js":8,"./src/SHProduct.js":9,"./src/SHPurchase.js":10,"./src/SHPurchaseEntry.js":11,"./src/SHShop.js":12,"./src/SHTransaction.js":13,"./src/SHUser.js":14}],2:[function(require,module,exports){
'use strict';

/**
 * SH is the fundamental function for Shelf Library. All subclasses or methods will start with this function.
 * @class SH
 * @author Xujie Song
 * @copyright (c) SK8 PTY LTD 2015. All rights reserved.
 * @see {@link https://leancloud.cn/docs/leanengine_guide-node.html LeanEngine Reference}
 * @todo Resolve deploy error 'Unauthorized'
 */
module.exports = function(SH, AV) {
  SH.AV = AV;

  /**
   * Initiation method for Shelf App
   * @func SH.initialize
   * @param {String} shopId The id of the Shop. Usually link would look like http://shopId.shelf.is
   * @param {Object} callback An object that has an optional success function, that takes no arguments and will be called on a successful push, and an error function that takes a AV.Error and will be called if the push failed.
   * @example SH.initialize("abcdShopId", {
   *          success: function(shop) {
   *              //$rootScope.currentShop = SH.currentShop;
   *              //$rootScope.currentSeller = SH.currentShop.owner;
   *              //$rootScope.currentUser = SH.currentUser;
   *              //$scope.reloadShop(shop);
   *          },
   *          error: function(error) {
   *              SH.showError(error);
   *          }
   * });
   */
  SH.initialize = function(shopId, callback) {

    //Default settings
    var STRIPE_PUBLIC_KEY = "pk_live_13Mk08vEXmVPXv0guoFQOeyw";
    var STRIPE_PUBLIC_TEST_KEY = "pk_test_YwEhOts3aEcG1CBdzgt9kHjQ";
    
    /**
     * Do not remove, for Future IM Usage
     * @type {String}
     */
    // var YTX_ACCOUNT_SID = "";
    // var YTX_ACCOUNT_AUTH_TOKEN = "";
    // var YTX_APP_ID = "";
    /** 
     * Verification code for mobile number verification
     * @type {Int} verificationCode 6 digit number
     */
    var verificationCode = 0;
    /**
     * Custom Variables required by Shelf Library, but is dependent on End App  
     * Set them in initialize() method
     */
    // var ORANGE_PRIMARY = "#ff6600";
    // var ORANGE_SECONDARY = "#ff9933";
    // var WHITE = "#ffffff";
    // var GREY_LIGHTEST = "#f7f7f7";
    // var GREY = "#dddddd";
    // var GREY_DARKEST = "#777777";
    // var BLACK = "#222222";
    // SH.primaryColor = "#339900";
    // SH.secondaryColor = "#99CC33";
    // SH.primaryColorReverse = "#FF6600";
    // SH.grey = "#666666";
    // SH.whitePrimary = "#FCFDF9";
    // SH.whiteSecondary = "#DFDDDD";
    //Static variables for easy use

    /**
     * Download the corresponding shop
     */
    var query = new AV.Query(SH.Shop);
    query.equalTo("subURL", shopId);
    query.include("owner");
    query.include("address");
    query.include("category");
    query.first({
      success: function(shop) {
        //reset dynamic routing
        //console.log("Starting routing " + shop.name + shop.routing["home"]["route"]);
        SH.currentShop = shop;
        SH.currentSeller = shop.owner;
        //Save current user
        if (SH.User.current() != undefined) {
          SH.currentUser = SH.User.current();
          callback.success(shop);
        } else {
          SH.logout({
            success: function(user) {
              SH.currentUser = user;
              callback.success(shop);
            },
            error: function(error) {
              callback.error(error);
            }
          });
        }
      },
      error: function(error) {
        callback.error(error);
      }
    });
    /**
     * DO NOT REMOVE!!
     * For future usage, fetching current location
     */
    // if (navigator.geolocation) {
    //     navigator.geolocation.getCurrentPosition(function (position) {
    //         SH.currentLocation = position;
    //     });
    // }

  };
  /**
   * Logout the currentUser and Create a new Anonymous user 
   * @func SH.logout
   * @param {Object} [callback] An object that has an optional success function, that takes no arguments and will be called on a successful push, and an error function that takes a AV.Error and will be called if the push failed.
   * @see {@link leancloud.cn/docs/rest_api.html }
   * @example SH.logout({
   *          success: function(user) {
   *              //User logged out, return with the new anonymous user
   *          },
   *          error: function(error) {
   *              //SH.showError(error);
   *          }
   *      });
   * @todo Test if the function is working
   */
  SH.logout = function(callback) {
      SH.User.logOut();
      SH.createAnonymousUser({
        success: function(user) {
          //$rootScope.currentUser = result;
          var sessionToken = user.sessionToken;
          SH.User.become(sessionToken, {
            success: function(u) {
              callback.success(u);
            },
            error: function(error) {
              callback.error(error);
            }
          });
        },
        error: function(user, error) {
          callback.error(error);
        }
      });
    }
    /**
     * Clear the current purchase, and create a new SH.Purchase instance for the current user
     * @func SH.clearCurrentPurchase
     */
  SH.clearCurrentPurchase = function() {
      var purchase = SH.Purchase.new();
      purchase.status = SH.Purchase.STATUS_INITIATED;
      purchase.buyer = SH.currentUser;
      SH.currentPurchase = purchase;
    }
    /**
     * Create a new anonymous user via REST API <br>
     * Can be integrated with REST API login <br>
     * @func SH.createAnonymousUser
     * @param {Object} [callback] An object that has an optional success function, that takes no arguments and will be called on a successful push, and an error function that takes a AV.Error and will be called if the push failed.
     * @example SH.createAnonymousUser({
     *          success: function(user) {
     *              //Access user here
     *          },
     *          error: function(error) {
     *              //SH.showError(error);
     *          }
     * });
     * @see {@link https://leancloud.cn/docs/js_guide.html#绑定第三方平台账户}
     */
  SH.createAnonymousUser = function(callback) {
      /**
       * generate 18 digits hex string
       * @func SH.Query.generateRandomId
       * @param {String} 18 digits hex number
       */
      var generateRandomId = function() {
        var min = 10000000000000000000;
        var max = 99999999999999999999;
        var random = Math.floor(Math.random() * (max - min + 1)) + min;
        var result = random.toString(16);
        return result;
      }
      var id = generateRandomId();
      var url = "https://api.leancloud.cn/1.1/users";
      var data = {
        authData: {
          anonymous: {
            id: id
          }
        }
      }
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && (xmlhttp.status == 200 || xmlhttp.status == 201)) {
          /**
           * result(User) will be a JS Object
           * key: username
           * key: sessionToken
           * key: createdAt
           * key: objectId
           */
          var myArr = JSON.parse(xmlhttp.responseText);
          //Check for undefined, preventing the rest of code to crash
          if (callback) {
            callback.success(myArr);
          }
        } else if (xmlhttp.readyState == 4 && xmlhttp.status != 201 && xmlhttp.status != 200) {
          //Check for undefined, preventing the rest of code to crash
          if (callback) {
            callback.error({
              "message": "state: " + xmlhttp.status + " | " + xmlhttp.readyState
            });
          }
        }
      }
      xmlhttp.open('POST', url, true);
      xmlhttp.setRequestHeader("Content-Type", "application/json");
      xmlhttp.setRequestHeader("X-LC-Id", SH.APP_ID);

    /**
     * Use LC-Sign, require md5
     */
      //var timestamp = new Date().getTime();
      //var sign = md5(timestamp + SH.App_Key);
      //xmlhttp.setRequestHeader("X-LC-Sign", sign + "," + timestamp);
      //xmlhttp.setRequestHeader("data-urlencode", this.cql);
      xmlhttp.setRequestHeader("X-LC-Key", SH.APP_KEY);

    xmlhttp.send(JSON.stringify(data));
    }
    /**
     * Show an promote to user, it's currently an alert.
     * @func SH.Promote
     * @param {String} message The message you wish to promote
     * @example SH.promote("Shelf is awesome!");
     */
  SH.promote = function(message) {
      SH.log(message);
      window.alert(message);
    }
    /**
     * Log the error message in console, and 'promote' it to user
     * @func SH.showError
     * @param {Error} error HTTP Error
     * @example SH.showError(error);
     */
  SH.showError = function(error) {
      SH.log(error.message);
      window.alert(error.message);
    }
    /**
     * custom SH.log function.
     * @func SH.log
     * @param {String} message The message you wish to log
     * @example SH.log(message);
     */
  SH.log = function(message) {
      console.log(message);
    }
    /**
     * Send an SMS to the given receiver
     * @func SH.sendSMS
     * @param {Object} params - The data of the SMS. Valid fields are: <br>
     *     receiver - A String for the receiver's phone address, including the country code. <br>
     *     message - A String for the message to be sent.
     * @param {Object} [callback] An object that has an optional success function, that takes no arguments and will be called on a successful push, and an error function that takes a AV.Error and will be called if the push failed.
     * @see {@link https://www.twilio.com/docs/api Twilio API}
     * @example SH.sendSMS({
     *          message: "Shelf is awesome!",
     *          receiver: "+61449843149"
     *      }, {
     *          success: function(message) {
     *              //SMS sent successfully
     *          },
     *          error: function(error) {
     *              //SH.showError(error);
     *          }
     *      });
     * @todo Test if the function is working
     */
  SH.sendSMS = function(data, callback) {
      AV.Cloud.run('sendSMS', params, callback);
    }
    /**
     * Send an Email to the given receiver
     * @func SH.sendEmail
     * @param {Object} params - The data of the email. Valid fields are: <br>
     *     name - A String for the sender's name. <br>
     *     email - A String for the sender's email address. <br>
     *     receiver - A String for the receiver's email address. <br>
     *     subject - A String for the subject of the email. <br>
     *     message - A String for the message to be sent.
     * @param {Object} [callback] An object that has an optional success function, that takes no arguments and will be called on a successful push, and an error function that takes a AV.Error and will be called if the push failed.
     * @see {@link https://documentation.mailgun.com/ Mailgun API}
     * @example SH.sendEmail({
     *          'name': "Jack",
     *          'email': "jack@sk8.asia",
     *          'receiver': "feedback@sk8.asia",
     *          'subject': "Shelf Enquiry",
     *          'message': "Shelf is Awesome!"
     *      }, {
     *          success: function(message) {
     *              //Email sent successfully
     *          },
     *          error: function(error) {
     *              //SH.showError(error);
     *          }
     *      });
     * @todo Test if the function is working
     */
  SH.sendEmail = function(params, callback) {
      AV.Cloud.run('sendEmail', params, callback);
    }
    /**
     * Send an Push Notification to the given receiver
     * @func SH.sendPush
     * @param {Object} params - The data of the push notification. Valid fields are: <br>
     *     channels - An Array of channels to push to. <br>
     *     push_time - A Date object for when to send the push. <br>
     *     expiration_time - A Date object for when to expire the push. <br>
     *     expiration_interval - The seconds from now to expire the push. <br>
     *     where - A AV.Query over AV.Installation that is used to match a set of installations to push to. <br>
     *     cql - A CQL statement over AV.Installation that is used to match a set of installations to push to. <br>
     *     data - The data to send as part of the push
     * @param {Object} [callback] An object that has an optional success function, that takes no arguments and will be called on a successful push, and an error function that takes a AV.Error and will be called if the push failed.
     * @see {@link https://leancloud.cn/docs/js_push.html#Demo_及示例代码 }
     * @example SH.sendPush({
     *          // channels: ['aaa'],
     *          data: {message: "Shelf is Awesome!"}
     *      }, {
     *          success: function(message) {
     *              //Push sent successfully
     *          },
     *          error: function(error) {
     *              //SH.showError(error);
     *          }
     *      });
     * @todo Test if the function is working
     */
  SH.sendPush = function(params, callback) {
      var push = AV.push({
        appId: AV_App_Id,
        appKey: AV_App_Key
      });
      push.send(params, callback);
    }
    /**
     * Open the url in a new tab
     * @param {String} URL URL of the website
     */
  SH.openURL = function(url) {
    window.open(url, '_blank', 'resizable=yes');
  }
}
},{}],3:[function(require,module,exports){
'use strict';

/**
 * Class for all address object used in Shelf system
 * @class SH.Address
 * @memberof! <global>
 * @author Xujie Song
 * @copyright (c) SK8 PTY LTD 2015. All rights reserved.
 * @extends {AV.Object}
 * @see {@link https://leancloud.cn/docs/js_guide.html#对象 AV.Object}
 * @property {String} city City of this address
 * @property {String} contactNumber Contact Number
 * @property {String} country Country of this address
 * @property {AV.GeoPoint} geoPoint Geo Point of this address
 * @property {int} postalCode Postcode of this address
 * @property {String} recipient Recipient of this address
 * @property {String} state State of this address
 * @property {String} streetAddress StreetAddress of this address
 * @property {String} userId The id of the owner of this address
 */
module.exports = function(SH, AV) {
    /**
     * Recommended way to
     * Initialize a new instance of the Class
     * @func SH.Address.prototype.new
     * @param {Object} [data] An json object that contains the data
     * @example var address = SH.Address.new({"id": "abcd");
     */
    SH.Address = AV.Object.extend("Address", {
        //Instance variables
        //Instance functions
    }, {
        //Static variables
        //Static functions
    });
    Object.defineProperty(SH.Address.prototype, "city", {
        get: function() {
            return this.get("city");
        },
        set: function(value) {
            this.set("city", value);
        }
    });
    Object.defineProperty(SH.Address.prototype, "contactNumber", {
        get: function() {
            return this.get("contactNumber");
        },
        set: function(value) {
            this.set("contactNumber", value);
        }
    });
    Object.defineProperty(SH.Address.prototype, "country", {
        get: function() {
            return this.get("country");
        },
        set: function(value) {
            this.set("country", value);
        }
    });
    Object.defineProperty(SH.Address.prototype, "geoPoint", {
        get: function() {
            return this.get("geoPoint");
        },
        set: function(value) {
            this.set("geoPoint", value);
        }
    });
    Object.defineProperty(SH.Address.prototype, "postalCode", {
        get: function() {
            return this.get("postalCode");
        },
        set: function(value) {
            this.set("postalCode", parseInt(value));
        }
    });
    Object.defineProperty(SH.Address.prototype, "recipient", {
        get: function() {
            return this.get("recipient");
        },
        set: function(value) {
            this.set("recipient", value);
        }
    });
    Object.defineProperty(SH.Address.prototype, "state", {
        get: function() {
            return this.get("state");
        },
        set: function(value) {
            this.set("state", value);
        }
    });
    Object.defineProperty(SH.Address.prototype, "streetAddress", {
        get: function() {
            return this.get("streetAddress");
        },
        set: function(value) {
            this.set("streetAddress", value);
        }
    });
    Object.defineProperty(SH.Address.prototype, "userId", {
        get: function() {
            return this.get("userId");
        },
        set: function(value) {
            this.set("userId", value);
        }
    });
}
},{}],4:[function(require,module,exports){
'use strict';

/**
 * Class for all category object used in Shelf system
 * @class SH.Category
 * @memberof! <global>
 * @author Xujie SOng
 * @copyright SK8 PTY LTD 2015
 * @extends {AV.Object}
 * @see {@link https://leancloud.cn/docs/js_guide.html#对象 AV.Object}
 * @property {String} name Name of this Category
 * @property {AV.File} image Image of this Category
 * @property {SH.Category} parentCategory Parent category of this Category
 */
module.exports = function(SH, AV) {
    /**
     * Recommended way to
     * Initialize a new instance of the Class
     * @func SH.Category.prototype.new
     * @param {Object} [data] An json object that contains the data
     * @example var category = SH.Category.new({"id": "abcd");
     */
    SH.Category = AV.Object.extend("Category", {
        //Instance variables
        //Instance functions
    }, {
        //Static variables
        //Static functions
    });
    Object.defineProperty(SH.Category.prototype, "name", {
        get: function () {
            return this.get("name");
        },
        set: function (value) {
            this.set("name", value);
        }
    });
    Object.defineProperty(SH.Category.prototype, "image", {
        get: function () {
            return this.get("image");
        },
        set: function (value) {
            this.set("image", value);
        }
    });
    Object.defineProperty(SH.Category.prototype, "parentCategory", {
        get: function () {
            return this.get("parentCategory");
        },
        set: function (value) {
            this.set("parentCategory", value);
        }
    });
}
},{}],5:[function(require,module,exports){
'use strict';

/**
 * Class for all comment object used in Shelf system
 * @class SH.Comment
 * @memberof! <global>
 * @author Xujie Song
 * @copyright SK8 PTY LTD 2015
 * @extends {AV.Object}
 * @see {@link https://leancloud.cn/docs/js_guide.html#对象 AV.Object}
 * @property {SH.Product} product Product of this Comment
 * @property {SH.User} sender Sender of this Comment
 * @property {String} text Text of this Comment
 */
module.exports = function(SH, AV) {
    /**
     * Recommended way to
     * Initialize a new instance of the Class
     * @func SH.Comment.prototype.new
     * @param {Object} [data] An json object that contains the data
     * @example var comment = SH.Comment.new({"id": "abcd");
     */
    SH.Comment = AV.Object.extend("Comment", {
        //Instance variables
        //Instance functions
    }, {
        //Static variables
        //Static functions
    });
    Object.defineProperty(SH.Comment.prototype, "product", {
        get: function() {
            return this.get("product");
        },
        set: function(value) {
            this.set("product", value);
        }
    });
    Object.defineProperty(SH.Comment.prototype, "sender", {
        get: function() {
            return this.get("sender");
        },
        set: function(value) {
            this.set("sender", value);
        }
    });
    Object.defineProperty(SH.Comment.prototype, "text", {
        get: function() {
            return this.get("text");
        },
        set: function(value) {
            this.set("text", value);
        }
    });
}
},{}],6:[function(require,module,exports){
'use strict';

/**
 * Utility Error Function, declare system errors here
 * @func SH.Error
 * @author Xujie Song
 * @copyright SK8 PTY LTD 2015
 * @param {Int} Error The error code
 * @return {String} Error description
 */
module.exports = function(SH, AV) {
    SH.Error = function (Error) {
        var ErrorCode = " Error: " + ("000" + Error).slice(-4);
        switch (Error) {
            case 0:
                // A user (SHUser) object is required before saving an SHAddress object
                var message = "Address is missing user."
                return message + ErrorCode;
                break;
            case 1:
                // A recipient (String) is required before saving an SHAddress object
                var message = "Address is missing recipient."
                return message + ErrorCode;
                break;
            case 2:
                // A contactNumber (String) is required before saving an SHAddress object
                var message = "Address is missing contact number."
                return message + ErrorCode;
                break;
            case 3:
                // A streetAddress (String) is required before saving an SHAddress object
                var message = "Address is missing street address."
                return message + ErrorCode;
                break;
            case 4:
                // A city (String) is required before saving an SHAddress object
                var message = "Address is missing city."
                return message + ErrorCode;
                break;
            case 5:
                // A state (String) is required before saving an SHAddress object
                var message = "Address is missing state."
                return message + ErrorCode;
                break;
            case 6:
                // A country (String) is required before saving an SHAddress object
                var message = "Address is missing country."
                return message + ErrorCode;
                break;
            case 7:
                // A postalCode (Number) is required before saving an SHAddress object
                var message = "Address is missing postal code."
                return message + ErrorCode;
                break;
            case 10:
                // A name (String) is required before saving an SHCategory object
                var message = "Category is missing name."
                return message + ErrorCode;
                break;
            case 20:
                // A user (SHUser) is required before saving an SHComment object
                var message = "Comment is missing user."
                return message + ErrorCode;
                break;
            case 21:
                // A product (SHProduct) is required before saving an SHComment object
                var message = "Comment is missing product."
                return message + ErrorCode;
                break;
            case 22:
                // A text (String) is required before saving an SHComment object
                var message = "Comment is missing text."
                return message + ErrorCode;
                break;
            case 30:
                // A shop (SH.Shop) is required before saving an SHMembership object
                var message = "Membership is missing target shop."
                return message + ErrorCode;
                break;
            case 31:
                // A user (SHUser) is required before saving an SHMembership object
                var message = "Membership is missing target user."
                return message + ErrorCode;
                break;
            case 40:
                // A category (SHCategory) is required before saving an SHProduct object
                var message = "Product is missing category."
                return message + ErrorCode;
                break;
            case 41:
                // A cover image (AVFile) is required before saving an SHProduct object
                var message = "Product is missing cover image."
                return message + ErrorCode;
                break;
            case 42:
                // A currency (String) is required before saving an SHProduct object
                var message = "Product is missing currency."
                return message + ErrorCode;
                break;
            case 43:
                // A price (float) is required before saving an SHProduct object
                var message = "Product is missing price."
                return message + ErrorCode;
                break;
            case 44:
                // A name (String) is required before saving an SHProduct object
                var message = "Product is missing name."
                return message + ErrorCode;
                break;
            case 45:
                // Product price cannot be $0.00
                var message = "Product price cannot be $0.00."
                return message + ErrorCode;
                break;
            case 46:
                // A seller (SHUser) is required before saving an SHProduct object
                var message = "Product is missing seller."
                return message + ErrorCode;
                break;
            case 50:
                // A buyer (SHUser) is required before saving an SHPurchase object
                var message = "Purchase is missing buyer."
                return message + ErrorCode;
                break;
            case 51:
                // A deliveryAddress (SHAddress) is required before saving an SHPurchase object
                var message = "Purchase is missing delivery address."
                return message + ErrorCode;
                break;
            case 52:
                // A totalPriceInCent (int) is required before saving an SHPurchase object
                var message = "Purchase is missing total price."
                return message + ErrorCode;
                break;
            case 53:
                // totalPriceInCent cannot be 0
                var message = "Total cannot be $0.00 for a purchase."
                return message + ErrorCode;
                break;
            case 54:
                // A description (String) is required before saving an SHPurchase object
                var message = "Purchase is missing description."
                return message + ErrorCode;
                break;
            case 55:
                // A currency (String) is required before saving an SHPurchase object
                var message = "Purchase is missing currency detail."
                return message + ErrorCode;
                break;
            case 45:
                // A currency (String) is required before saving an SHPurchase object
                var message = "Purchase is missing currency detail."
                return message + ErrorCode;
            case 46:
                // A token (String) is required before saving an SHPurchase object
                var message = "Purchase is missing payment detail."
                return message + ErrorCode;
                break;
            case 60:
                // A buyer (SHUser) is required before saving an SHPurchaseEntry object
                var message = "PurchaseEntry is missing buyer."
                return message + ErrorCode;
                break;
            case 61:
                // A seller (SHUser) is required before saving an SHPurchaseEntry object
                var message = "PurchaseEntry is missing seller."
                return message + ErrorCode;
                break;
            case 62:
                // A product (SHProduct) is required before saving an SHPurchaseEntry object
                var message = "PurchaseEntry is missing product."
                return message + ErrorCode;
                break;
            case 63:
                // A purchase (SHPurchase) is required before saving an SHPurchaseEntry object
                var message = "PurchaseEntry is missing purchase."
                return message + ErrorCode;
                break;
            case 64:
                // A deliveryAdderss (SHAddress) is required before saving an SHPurchaseEntry object
                var message = "SHPurchaseEntry is missing delivery address."
                return message + ErrorCode;
                break;
            case 65:
                // One or more product is out of order
                var message = "Product is out of order."
                return message + ErrorCode;
                break;
            case 70:
                // Shop can only be modified by its owner
                var message = "Shop can only be modified by its owner."
                return message + ErrorCode;
                break;
            case 71:
                //content (SHPage) is required before saving an SHPage object
                var message = "SHPage is missing content."
                return message + ErrorCode;
                break;
            case 72:
                //description (SHPage) is required before saving an SHPage object
                var message = "SHPage is missing description."
                return message + ErrorCode;
                break;
            case 73:
                //keyword (SHPage) is required before saving an SHPage object
                var message = "SHPage is missing keyword."
                return message + ErrorCode;
                break;
            case 74:
                //title (SHPage) is required before saving an SHPage object
                var message = "SHPage is missing title."
                return message + ErrorCode;
                break;
            default:
                // Error code not found
                var message = "Error cound not found."
                return message + ErrorCode;
                break;
        }
    }
}
},{}],7:[function(require,module,exports){
'use strict';

/**
 * Class for all Membership object used in Shelf system
 * @class SH.Membership
 * @memberof! <global>
 * @author Xujie Song
 * @copyright SK8 PTY LTD 2015
 * @extends {AV.Object}
 * @see {@link https://leancloud.cn/docs/js_guide.html#对象 AV.Object}
 * @property {Int} rewardPoint RewardPoint of this Membership
 * @property {SH.Shop} shop Shop of this Membership
 * @property {SH.User} member The owner of this Membership
 */
module.exports = function(SH, AV) {
    /**
     * Recommended way to
     * Initialize a new instance of the Class
     * @func SH.Membership.prototype.new
     * @param {Object} [data] An json object that contains the data
     * @example var membership = SH.Membership.new({"id": "abcd");
     */
    SH.Membership = AV.Object.extend("Membership", {
        //Instance variables
        //Instance functions
    }, {
        //Static variables
        //Static functions
    });
    Object.defineProperty(SH.Membership.prototype, "rewardPoint", {
        get: function() {
            return this.get("rewardPoint");
        },
        set: function(value) {
            this.set("rewardPoint", parseInt(value));
        }
    });
    Object.defineProperty(SH.Membership.prototype, "shop", {
        get: function() {
            return this.get("shop");
        },
        set: function(value) {
            this.set("shop", value);
        }
    });
    Object.defineProperty(SH.Membership.prototype, "user", {
        get: function() {
            return this.get("user");
        },
        set: function(value) {
            this.set("user", value);
        }
    });
    /**
     * Send the comment to a product
     * @func SH.Membership.prototype.send
     * @param {Int} points Number of points to accumulate
     * @param {Object} [callback] An object that has an optional success function, that takes no arguments and will be called on a successful push, and an error function that takes a AV.Error and will be called if the push failed.
     * @example membership.accumulateReward(points, {
     *          success: function(membership) {
     *              //Membership accumulated successfully
     *          },
     *          error: function(error) {
     *              //SH.showError(error);
     *          }
     *      });
     */
    SH.Membership.prototype.accumulateReward = function(points, callback) {
        this.increment("rewardPoint", points);
        this.save(callback);
    }
}
},{}],8:[function(require,module,exports){
'use strict';

/**
 * Class for all Page object used in Shelf system
 * @class SH.Page
 * @memberof! <global>
 * @author Tianyi Li
 * @copyright SK8 PTY LTD 2015
 * @extends {AV.Object}
 * @see {@link https://leancloud.cn/docs/js_guide.html#对象 AV.Object}
 * @property {String} content Content of this Page
 * @property {String} description Description of this Page
 * @property {String} keyword Keyword of this Page
 * @property {String} title Title of this Page
 */
module.exports = function(SH, AV) {
    /**
     * Recommended way to
     * Initialize a new instance of the Class
     * @func SH.Page.prototype.new
     * @param {Object} [data] An json object that contains the data
     * @example var page = SH.Page.new({"id": "abcd");
     */
    SH.Page = AV.Object.extend("Page", {
        //Instance variables
        //Instance functions
    }, {
        //Static variables
        //Static functions
    });
    Object.defineProperty(SH.Page.prototype, "content", {
        get: function() {
            return this.get("content");
        },
        set: function(value) {
            this.set("content", value);
        }
    });
    Object.defineProperty(SH.Page.prototype, "description", {
        get: function() {
            return this.get("description");
        },
        set: function(value) {
            this.set("description", value);
        }
    });
    Object.defineProperty(SH.Page.prototype, "keyword", {
        get: function() {
            return this.get("keyword");
        },
        set: function(value) {
            this.set("keyword", value);
        }
    });
    Object.defineProperty(SH.Page.prototype, "title", {
        get: function() {
            return this.get("title");
        },
        set: function(value) {
            this.set("title", value);
        }
    });
}
},{}],9:[function(require,module,exports){
'use strict';

/**
 * Class for all Product object used in Shelf system
 * @class SH.Product
 * @memberof! <global>
 * @author Xujie Song
 * @copyright SK8 PTY LTD 2015
 * @extends {AV.Object}
 * @see {@link https://leancloud.cn/docs/js_guide.html#对象 AV.Object}
 * @property {SH.Category} category Category of this Product
 * @property {Int} condition Condition of this Product
 * @property {String} currency Currency of this Product
 * @property {AV.File} coverImage CoverImage of this Product
 * @property {Int} deliveryPriceInCent DeliveryPriceInCent of this Product
 * @property {Array} imageArray ImageArray of this Product
 * @property {String} name Name of this Product
 * @property {Int} priceInCent PriceInCent of this Product
 * @property {Int} promoPriceInCent PromoPriceInCent of this Product
 * @property {Int} quantity Quantity of this Product
 * @property {SH.User} seller Seller of this Product
 * @property {SH.Shop} shop Shop of this Product
 * @property {SH.Product.STATUS_X} status Status of this Product
 * @property {String} summary Summary of this Product
 * @property {Float} deliveryPrice DeliveryPrice of this Product
 * @property {Float} price Price of this Product
 * @property {Float} promoPrice PromoPrice of this Product
 */
module.exports = function(SH, AV) {
    /**
     * Recommended way to
     * Initialize a new instance of the Class
     * @func SH.Product.prototype.new
     * @param {Object} [data] An json object that contains the data
     * @example var product = SH.Product.new({"id": "abcd");
     */
    SH.Product = AV.Object.extend("Product", {
        //Instance variables
        //Instance functions
        initialize: function(attr, options) {
            this.set("imageArray", []);
        }
    }, {
        //Static variables
        //Static functions
    });
    /**
     * @name SH.Product.STATUS_X
     * @description SH.Product.STATUS_X is the available status code describing the status of the product.
     * @property {int} STATUS_LISTING Status code indicating product is still in-stock and listing.
     * @property {int} STATUS_PREORDER Status code indicating product is on pre-order.
     * @property {int} STATUS_SOLDOUT Status code indicating product is sold out.
     * @property {int} STATUS_REPORTED Status code indicating product is reported by user.
     * @property {int} STATUS_DELISTED Status code indicating product is removed from listing.
     * @property {int} STATUS_DELETED Status code indicating product is deleted.
     */
    SH.Product.STATUS_LISTING = 0;
    SH.Product.STATUS_PREORDER = 100;
    SH.Product.STATUS_SOLDOUT = 200;
    SH.Product.STATUS_REPORTED = 700;
    SH.Product.STATUS_DELISTED = 800;
    SH.Product.STATUS_DELETED = 900;
    Object.defineProperty(SH.Product.prototype, "category", {
        get: function() {
            return this.get("category");
        },
        set: function(value) {
            this.set("category", value);
        }
    });
    Object.defineProperty(SH.Product.prototype, "condition", {
        get: function() {
            if (this.get("condition") != null) {
                return this.get("condition");
            } else {
                this.set("condition", 10);
                return 0;
            }
        },
        set: function(value) {
            this.set("condition", value);
        }
    });
    Object.defineProperty(SH.Product.prototype, "currency", {
        get: function() {
            return this.get("currency");
        },
        set: function(value) {
            this.set("currency", value);
        }
    });
    Object.defineProperty(SH.Product.prototype, "coverImage", {
        get: function() {
            return this.get("coverImage");
        },
        set: function(value) {
            this.set("coverImage", value);
        }
    });
    Object.defineProperty(SH.Product.prototype, "deliveryPriceInCent", {
        get: function() {
            if (this.get("deliveryPriceInCent") != undefined) {
                return parseFloat(this.get("deliveryPriceInCent"));
            } else {
                this.set("deliveryPriceInCent", parseInt(0));
                return 0;
            }
        },
        set: function(value) {
            this.set("deliveryPriceInCent", parseInt(value));
        }
    });
    Object.defineProperty(SH.Product.prototype, "imageArray", {
        get: function() {
            return this.get("imageArray");
        },
        set: function(value) {
            this.set("imageArray", value);
        }
    });
    Object.defineProperty(SH.Product.prototype, "name", {
        get: function() {
            return this.get("name");
        },
        set: function(value) {
            this.set("name", value);
        }
    });
    Object.defineProperty(SH.Product.prototype, "priceInCent", {
        get: function() {
            if (this.get("priceInCent") != undefined) {
                return parseFloat(this.get("priceInCent"));
            } else {
                this.set("priceInCent", parseInt(0));
                return 0;
            }
        },
        set: function(value) {
            this.set("priceInCent", parseInt(value));
        }
    });
    Object.defineProperty(SH.Product.prototype, "promoPriceInCent", {
        get: function() {
            if (this.get("promoPriceInCent") != undefined) {
                return parseFloat(this.get("promoPriceInCent"));
            } else {
                this.set("promoPriceInCent", parseInt(0));
                return 0;
            }
        },
        set: function(value) {
            this.set("promoPriceInCent", parseInt(value));
        }
    });
    Object.defineProperty(SH.Product.prototype, "quantity", {
        get: function() {
            var quantity = this.get("quantity");
            if (quantity != undefined) {
                if (quantity < 0) {
                    quantity = 0;
                }
                return quantity;
            } else {
                this.set("quantity", parInt(0));
                return 0;
            }
        },
        set: function(value) {
            this.set("quantity", parseInt(value));
        }
    });
    Object.defineProperty(SH.Product.prototype, "seller", {
        get: function() {
            return this.get("seller");
        },
        set: function(value) {
            this.set("seller", value);
        }
    });
    Object.defineProperty(SH.Product.prototype, "shop", {
        get: function() {
            return this.get("shop");
        },
        set: function(shop) {
            this.set("shop", shop);
            if (shop.owner != undefined) {
                this.seller = shop.owner;
            }
            if (shop.currency != undefined) {
                this.currency = shop.currency;
            }
        }
    });
    Object.defineProperty(SH.Product.prototype, "status", {
        get: function() {
            return this.get("status");
        },
        set: function(value) {
            this.set("status", parseInt(value));
        }
    });
    Object.defineProperty(SH.Product.prototype, "summary", {
        get: function() {
            return this.get("summary");
        },
        set: function(value) {
            this.set("summary", value);
        }
    });
    Object.defineProperty(SH.Product.prototype, "deliveryPrice", {
        get: function() {
            if (this.tempDeliveryPriceString == undefined) {
                this.tempDeliveryPriceString = parseFloat((this.deliveryPriceInCent / 100).toFixed(2));
            }
            return this.tempDeliveryPriceString;
        },
        set: function(value) {
            this.deliveryPriceInCent = parseInt(value * 100);
            //tempString is here to enable decimal input for ng-model
            this.tempDeliveryPriceString = value;
        }
    });
    Object.defineProperty(SH.Product.prototype, "price", {
        get: function() {
            if (this.tempPriceString == undefined) {
                this.tempPriceString = parseFloat((this.priceInCent / 100).toFixed(2));
            }
            return this.tempPriceString;
        },
        set: function(value) {
            this.priceInCent = parseInt(value * 100);
            //tempString is here to enable decimal input for ng-model
            this.tempPriceString = value;
        }
    });
    Object.defineProperty(SH.Product.prototype, "promoPrice", {
        get: function() {
            if (this.tempPromoPriceString == undefined) {
                this.tempPromoPriceString = parseFloat((this.promoPriceInCent / 100).toFixed(2));
            }
            return this.tempPromoPriceString;
        },
        set: function(value) {
            if (this.price < value) {
                this.price = value;
            }
            this.promoPriceInCent = parseInt(value * 100);
            //tempString is here to enable decimal input for ng-model
            this.tempPromoPriceString = value;
        }
    });
    /**
     * Get the query for comments related to the product
     * @func SH.Product.prototype.getCommentsQuery
     * @example var commentQuery = product.getCommentsQuery();
     */
    SH.Product.prototype.getCommentsQuery = function() {
            var query = new AV.Query(SH.Comment);
            query.ascending("createdAt");
            query.equalTo("product", this);
            return query;
        }
        /**
         * Get the query for comments related to the product
         * @func SH.Product.prototype.getLikedUserQuery
         * @example var userQuery = product.getLikedUserQuery();
         */
    SH.Product.prototype.getLikedUserQuery = function() {
        var query = AV.Relation.reverseQuery('_User', 'productLiked', this);
        return query;
    }
}
},{}],10:[function(require,module,exports){
'use strict';

/**
 * Class for all Purchase object used in Shelf system
 * @class SH.Purchase
 * @memberof! <global>
 * @author Xujie Song
 * @copyright (c) SK8 PTY LTD 2015. All rights reserved.
 * @extends {AV.Object}
 * @see {@link https://leancloud.cn/docs/js_guide.html#对象 AV.Object}
 * @property {SH.User} buyer The buyer of this Purchase
 * @property {String} comment The comment buyer left for seller
 * @property {String} currency The currency used of this Purchase
 * @property {SH.Address} deliveryAddress The deliveryAddress of this Purchase
 * @property {Int} deliveryPriceInCent The delivery price of this Purchase, in cent
 * @property {Int} priceInCent The subtotal price of this Purchase
 * @property {SH.Purchase.STATUS_X} status Status of this Purchase
 * @property {String} summary The summary of this Purchase
 * @property {String} transactionId The chargeId of the charge object used in Stripe
 * @see {@link https://stripe.com/docs/api/node#charges }
 */
module.exports = function(SH, AV) {
	/**
	 * Recommended way to
	 * Initialize a new instance of the Class
	 * @func SH.Purchase.prototype.new
	 * @param {Object} [data] An json object that contains the data
	 * @example var purchase = SH.Purchase.new();
	 */
	SH.Purchase = AV.Object.extend("Purchase", {
		itemList: [],
		status: 0,
		totalPriceInCent: 0


	}, {
		//Static variables
		//Static functions
	});


	/**
	 * Add a product the the purchase
	 * @func SH.Purchase.prototype.addProduct
	 * @param {SH.User} buyer The buyer of the purchase
	 * @param {SH.Product} product The product to add to purchase
	 * @param {Int} quantity The quantity adding to cart
	 * @example 
	 *   	purchase.addProduct(product);
	 */
	SH.Purchase.prototype.addProduct = function (buyer, product, quantity) {
		if (this.status == SH.Purchase.STATUS_INITIATED) {
			var purchaseEntry = SH.PurchaseEntry.new();
			purchaseEntry.buyer = buyer;
			purchaseEntry.product = product;
			purchaseEntry.quantity = quantity;
			purchaseEntry.seller = product.seller;
			purchaseEntry.purchase = this;
			purchaseEntry.deliveryAddress = buyer.address;
			//SH.log("address.id: " + address.id);
			var priceInCent = product.promoPrice;
			if (priceInCent == 0 || priceInCent == null) {
				priceInCent = product.price * quantity;
			} else {
				priceInCent = priceInCent * quantity;
			}
			purchaseEntry.purchasePriceInCent = priceInCent;
			this.itemList.push(purchaseEntry);
		} else {
			SH.log("Purchase can only be modified before payment.");
		}
	};

	/**
	 * Remove a product from the purchase
	 * @func SH.Purchase.prototype.removeProduct
	 * @param {SH.Product} product The product to remove
	 * @example 
	 * 		purchase.removeProduct(product);
	 */
	SH.Purchase.prototype.removeProduct = function(product) {
		if (this.status == SH.Purchase.STATUS_INITIATED) {
			var position = NaN;
			for (var i = 0; i < this.itemList.length; i++) {
				if (this.itemList[i].product === product) {
					SH.log("removeProduct found: " + "[" + i + "] " + this.itemList[i].product.name);
					position = i;
				}
			}
			if (position != NaN) {
				this.itemList.splice(position, 1);
			} else {
				SH.log("Product has not been found.");
			}
		} else {
			SH.log("Purchase can only be modified before payment.");
		}
	};

	/**
	 * Clear all purchase entries in the purchase
	 * @func SH.Purchase.prototype.clear
	 * @example purchase.clear();
	 */
	SH.Purchase.prototype.clear = function() {
		this.itemList = [];
	};

	/**
	 * Validate the purchase
	 * @func SH.Purchase.prototype.validatePurchase
	 * @return {Boolean} Wheather the purchase is valid
	 */
	SH.Purchase.prototype.validatePurchase = function() {
		// Then, check if item relation is empty
		if (this.itemList.length == 0) {
			SH.log("[itemList.length is 0]Please have at least one product to make the purchase.");
			return false;
		}
		// Check total price
		if (this.refreshPriceInCent() == 0) {
			SH.log("[priceInCent is 0]Please have at least one product to make the purchase.");
			return false;
		}
		// If everything went ok, checkOut the purchase
		return true;
	};

	/**
	 * Get the number of purchase entries. E.g. 3 Apples and 2 Pears, returns 2 products, counted by 'purchase entries' itself.
	 * @func SH.Purchase.prototype.getPurchaseEntryAmount
	 * @return {Int} The number of product. 
	 */
	SH.Purchase.prototype.getPurchaseEntryAmount = function() {
		if (!this.itemList) {
			return 0;
		} else {
			return this.itemList.length;
		};
	};

	/**
	 * Refresh the price, in <strong>CENT</strong>, for all purchase entries in this purchase
	 * @func SH.Purchase.prototype.refreshPriceInCent
	 * @return {Int} priceInCent The price in cent, <strong>excluding</strong> delivery price
	 */
	SH.Purchase.prototype.refreshPriceInCent = function() {
		var totalInCent = 0;
		for (var i = 0; i < this.itemList.length; i++) {
			//SH.log("In SDK -- itemList length: " + this.itemList.length)
			var product = this.itemList[i].product;
			var quantity = this.itemList[i].quantity;
			//First check if item is on promotion
			var priceInCent = product.promoPriceInCent;
			//SH.log("In SDK -- promoPriceInCent: " + priceInCent);
			//SH.log("In SDK -- quantity: " + quantity);
			if (priceInCent == 0 || !priceInCent) {
				priceInCent = product.priceInCent * quantity;
			} else {
				priceInCent = priceInCent * quantity;
			}
			totalInCent += priceInCent;
		}
		this.set("priceInCent", totalInCent);
		//SH.log("In SDK -- priceInCent: " + totalInCent);
		return totalInCent;
	};

	/**
	 * Refresh the price, in <strong>DOLLAR</strong>, for all purchase entries in this purchase
	 * @func SH.Purchase.prototype.refreshPrice
	 * @return {Int} price The price in dollar, <strong>excluding</strong> delivery price.
	 */
	SH.Purchase.prototype.refreshPrice = function() {
		var total = parseInt(this.refreshPriceInCent());
		total = total / 100
		return total
	};

	/**
	 * Refresh the <strong>delivery</strong> price, in <strong>CENT</strong>, for all purchase entries in this purchase
	 * @func SH.Purchase.prototype.refreshDeliveryInCent
	 * @return {Int} deliveryPriceInCent The delivery price in cent.
	 */
	SH.Purchase.prototype.refreshDeliveryInCent = function() {
		//Find the highest delivery fee
		var deliveryFee = 0;
		for (var i = 0; i < this.itemList.length; i++) {
			var product = this.itemList[i].product;
			//Find the maximum delivery fee
			var deliveryInCent = product.deliveryPrice;
			if (deliveryInCent > deliveryFee) {
				deliveryFee = deliveryInCent;
			}
		}
		this.set("deliveryPriceInCent", deliveryFee);
		//SH.log("In SDK -- DelieveryCent: " + deliveryFee);
		return deliveryFee;
	};

	/**
	 * Refresh the <strong>delivery</strong> price, in <strong>DOLLAR</strong>, for all purchase entries in this purchase
	 * @func SH.Purchase.prototype.refreshDelivery
	 * @return {Int} deliveryPriceInDollar The delivery price in dollar.
	 */
	SH.Purchase.prototype.refreshDelivery = function() {
		var totalDelivery = (parseInt(this.refreshDeliveryInCent())) / 100;
		return totalDelivery;
	};
	
	/**
	 * @name SH.Purchase.STATUS_X
	 * @description SH.Purchase.STATUS_X is the available status code describing the status of the purchase.
	 * @property {int} STATUS_INITIATED Status code indicating product is still in-stock and listing.
	 * @property {int} STATUS_PAYMENT_RECEIVED Status code indicating product is on pre-order.
	 * @property {int} STATUS_SUCCEEDED Status code indicating product is sold out.
	 * @property {int} STATUS_CANCELLED Status code indicating product is reported by user.
	 * @property {int} STATUS_DELETED Status code indicating product is removed from listing.
	 */
	SH.Purchase.STATUS_INITIATED = 0;
	SH.Purchase.STATUS_PAYMENT_RECEIVED = 100;
	SH.Purchase.STATUS_SUCCEEDED = 700;
	SH.Purchase.STATUS_CANCELLED = 800;
	SH.Purchase.STATUS_DELETED = 900;
	Object.defineProperty(SH.Purchase.prototype, "buyer", {
		get: function() {
			return this.get("buyer");
		},
		set: function(value) {
			this.set("buyer", value);
		}
	});
	Object.defineProperty(SH.Purchase.prototype, "comment", {
		get: function() {
			return this.get("comment");
		},
		set: function(value) {
			this.set("comment", value);
		}
	});
	Object.defineProperty(SH.Purchase.prototype, "currency", {
		get: function() {
			return this.get("currency");
		},
		set: function(value) {
			this.set("currency", value);
		}
	});
	Object.defineProperty(SH.Purchase.prototype, "deliveryAddress", {
		get: function() {
			return this.get("deliveryAddress");
		},
		set: function(value) {
			this.set("deliveryAddress", value);
		}
	});
	Object.defineProperty(SH.Purchase.prototype, "deliveryPriceInCent", {
		get: function() {
			return this.get("deliveryPriceInCent");
		},
		set: function(value) {
			this.set("deliveryPriceInCent", parseInt(value));
		}
	});
	Object.defineProperty(SH.Purchase.prototype, "priceInCent", {
		get: function() {
			return this.get("priceInCent");
		},
		set: function(value) {
			this.set("priceInCent", parseInt(value));
		}
	});

	Object.defineProperty(SH.Purchase.prototype, "status", {
		get: function() {
			return this.get("status");
		},
		set: function(value) {
			this.set("status", parseInt(value));
		}
	});
	Object.defineProperty(SH.Purchase.prototype, "summary", {
		get: function() {
			return this.get("summary");
		},
		set: function(value) {
			this.set("summary", value);
		}
	});
	Object.defineProperty(SH.Purchase.prototype, "totalPriceInCent", {
		get: function() {
			return this.get("totalPriceInCent");
		},
		set: function(value) {
			this.set("totalPriceInCent", parseInt(value));
		}
	});
	Object.defineProperty(SH.Purchase.prototype, "transactionId", {
		get: function() {
			return this.get("transactionId");
		},
		set: function(value) {
			this.set("transactionId", value);
		}
	});
	Object.defineProperty(SH.Purchase.prototype, "deliveryPrice", {
		get: function() {
			return parseFloat((this.deliveryPriceInCent / 100).toFixed(2));
		},
		set: function(value) {
			this.set("deliveryPriceInCent", parseInt(value * 100));
		}
	});
}
},{}],11:[function(require,module,exports){
'use strict';

/**
 * Class for all Page object used in Shelf system
 * @class SH.PurchaseEntry
 * @memberof! <global>
 * @author Xujie Song
 * @copyright SK8 PTY LTD 2015
 * @extends {AV.Object}
 * @see {@link https://leancloud.cn/docs/js_guide.html#对象 AV.Object}
 * @property {SH.User} buyer Buyer of this PurchaseEntry
 * @property {String} currency Current used for this PurchaseEntry
 * @property {SH.Address} deliveryAddress The deliveryAddress of this PurchaseEntry
 * @property {SH.Product} product Product of this PurchaseEntry
 * @property {SH.Purchase} purchase Purchase of this PurchaseEntry
 * @property {Int} purchasePriceInCent Historical price of this product at purchase
 * @property {Int} quantity Quantity of this PurchaseEntry
 * @property {Int} rating Rating of this PurchaseEntry
 * @property {SH.User} seller Seller of this PurchaseEntry
 * @property {SH.Shipping} shipping The shipping info of this PurchaseEntry
 * @property {SH.Shop} shop The shop info of this PurchaseEntry
 * @property {SH.PurchaseEntry.STATUS_X} status Status of this PurchaseEntry
 */
module.exports = function(SH, AV) {
	/**
	 * Recommended way to
	 * Initialize a new instance of the Class
	 * @func SH.PurchaseEntry.prototype.new
	 * @param {Object} [data] An json object that contains the data
	 * @example var purchaseEntry = SH.PurchaseEntry.new({"id": "abcd");
	 */
	SH.PurchaseEntry = AV.Object.extend("PurchaseEntry", {
		//Instance variables
		//Instance functions
	}, {
		//Static variables
		//Static functions
	});

	/**
	 * @name SH.PurchaseEntry.STATUS_X
	 * @description SH.PurchaseEntry.STATUS_X is the available status code describing the status of the purchase.
	 * @property {int} STATUS_INITIATED Status code indicating product is still in-stock and listing.
	 * @property {int} STATUS_PAYMENT_RECEIVED Status code indicating product is on pre-order.
	 * @property {int} STATUS_SUCCEEDED Status code indicating product is sold out.
	 * @property {int} STATUS_CANCELLED Status code indicating product is reported by user.
	 * @property {int} STATUS_DELETED Status code indicating product is removed from listing.
	 */

	//SH.PurchaseEntry.STATUS_INITIATED = 0;
	//SH.PurchaseEntry.STATUS_PENDING_VENDOR_DETAIL = 100;
	//SH.PurchaseEntry.STATUS_PENDING_VENDOR_DELIVERY = 150;
	//SH.PurchaseEntry.STATUS_PENDING_CUSTOMER_DETAIL = 200;
	//SH.PurchaseEntry.STATUS_PENDING_CUSTOMER_DELIVERY = 250;
	//SH.PurchaseEntry.STATUS_SUCCEEDED = 600;
	//SH.PurchaseEntry.STATUS_CANCELLED = 700;
	//SH.PurchaseEntry.STATUS_RETURNED = 800;
	//SH.PurchaseEntry.STATUS_DELETED = 900;

	SH.PurchaseEntry.STATUS_INITIATED = 0;
	SH.PurchaseEntry.STATUS_PAYMENT_RECEIVED = 100;
	SH.PurchaseEntry.STATUS_SUCCEEDED = 700;
	SH.PurchaseEntry.STATUS_CANCELLED = 800;
	SH.PurchaseEntry.STATUS_DELETED = 900;
	Object.defineProperty(SH.PurchaseEntry.prototype, "buyer", {
		get: function() {
			return this.get("buyer");
		},
		set: function(value) {
			this.set("buyer", value);
		}
	});
	Object.defineProperty(SH.PurchaseEntry.prototype, "currency", {
		get: function() {
			return this.get("currency");
		},
		set: function(value) {
			this.set("currency", value);
		}
	});
	Object.defineProperty(SH.PurchaseEntry.prototype, "deliveryAddress", {
		get: function() {
			return this.get("deliveryAddress");
		},
		set: function(value) {
			this.set("deliveryAddress", value);
		}
	});

	Object.defineProperty(SH.PurchaseEntry.prototype, "product", {
		get: function() {
			return this.get("product");
		},
		set: function(value) {
			this.set("product", value);
		}
	});
	Object.defineProperty(SH.PurchaseEntry.prototype, "purchasePriceInCent", {
		get: function() {
			return this.get("purchasePriceInCent");
		},
		set: function(value) {
			this.set("purchasePriceInCent", value);
		}
	});
	Object.defineProperty(SH.PurchaseEntry.prototype, "purchase", {
		get: function() {
			return this.get("purchase");
		},
		set: function(value) {
			this.set("purchase", value);
		}
	});

	Object.defineProperty(SH.PurchaseEntry.prototype, "quantity", {
		get: function() {
			return this.get("quantity");
		},
		set: function(value) {
			this.set("quantity", parseInt(value));
		}
	});
	Object.defineProperty(SH.PurchaseEntry.prototype, "rating", {
		get: function() {
			return this.get("rating");
		},
		set: function(value) {
			this.set("rating", parseInt(value));
		}
	});
	Object.defineProperty(SH.PurchaseEntry.prototype, "seller", {
		get: function() {
			return this.get("seller");
		},
		set: function(value) {
			this.set("seller", value);
		}
	});
	Object.defineProperty(SH.PurchaseEntry.prototype, "shipping", {
		get: function() {
			return this.get("shipping");
		},
		set: function(value) {
			this.set("shipping", value);
		}
	});
	Object.defineProperty(SH.PurchaseEntry.prototype, "shop", {
		get: function() {
			return this.get("shop");
		},
		set: function(value) {
			this.set("shop", value);
		}
	});
	Object.defineProperty(SH.PurchaseEntry.prototype, "status", {
		get: function() {
			return this.get("status");
		},
		set: function(value) {
			this.set("status", parseInt(value));
		}
	});
}
},{}],12:[function(require,module,exports){
'use strict';

/**
 * Class for all Page object used in Shelf system
 * @class SH.Shop
 * @memberof! <global>
 * @author Xujie Song
 * @copyright SK8 PTY LTD 2015
 * @extends {AV.Object}
 * @see {@link https://leancloud.cn/docs/js_guide.html#对象 AV.Object}
 * @property {String} aboutPage HTML String of the About Page
 * @property {SH.Address} address Address of this Shop
 * @property {String} currency Currency of this Shop
 * @property {String} email Email of this Shop
 * @property {String} facebook Facebook URL of this Shop
 * @property {AV.File} icon Icon of this Shop
 * @property {String} instagram Instagram URL of this Shop
 * @property {AV.File} lessFile LessFile of this Shop
 * @property {AV.File} logo Logo of this Shop
 * @property {String} menuTextColor MenuTextColor of this Shop, in hex string
 * @property {String} menuTextHoverColor MenuTextHoverColor of this Shop, in hex string
 * @property {String} name Name of this Shop
 * @property {Int} navLayout HTML String of NavLayout of this Shop
 * @property {Int} navStyle HTML String NavStyle of this Shop
 * @property {SH.User} owner Owner of this Shop
 * @property {SH.Page} page Page of this Shop
 * @property {Object} routing Routing of this Shop
 * @property {String} wechat Wechat ID of this Shop
 * @property {String} pinterest Pinterest URL of this Shop
 * @property {String} primaryColor PrimaryColor of this Shop, in hex string
 * @property {String} qq QQ of this Shop
 * @property {String} sinaWeibo SinaWeibo URL of this Shop
 * @property {String} secondaryColor SecondaryColor of this Shop, in hex string
 * @property {String} subURL SubURL of this Shop
 * @property {String} summary Summary of this Shop
 * @property {AV.File} tagline Tagline of this Shop
 * @property {String} twitter Twitter URL of this Shop
 */
module.exports = function(SH, AV) {
    /**
     * Recommended way to
     * Initialize a new instance of the Class
     * @func SH.Shop.prototype.new
     * @param {Object} [data] An json object that contains the data
     * @example var shop = SH.Shop.new({"id": "abcd");
     */
    SH.Shop = AV.Object.extend("Shop", {
        //Instance variables
        //Instance functions
    }, {
        //Static variables
        //Static functions
    });
    Object.defineProperty(SH.Shop.prototype, "aboutPage", {
        get: function() {
            return this.get("aboutPage");
        },
        set: function(value) {
            this.set("aboutPage", value);
        }
    });
    Object.defineProperty(SH.Shop.prototype, "address", {
        get: function() {
            return this.get("address");
        },
        set: function(value) {
            this.set("address", value);
        }
    });
    Object.defineProperty(SH.Shop.prototype, "currency", {
        get: function() {
            return this.get("currency");
        },
        set: function(value) {
            this.set("currency", value);
        }
    });
    Object.defineProperty(SH.Shop.prototype, "email", {
        get: function() {
            return this.get("email");
        },
        set: function(value) {
            this.set("email", value);
        }
    });
    Object.defineProperty(SH.Shop.prototype, "facebook", {
        get: function() {
            return this.get("facebook");
        },
        set: function(value) {
            this.set("facebook", value);
        }
    });
    Object.defineProperty(SH.Shop.prototype, "icon", {
        get: function() {
            return this.get("icon");
        },
        set: function(value) {
            this.set("icon", value);
        }
    });
    Object.defineProperty(SH.Shop.prototype, "instagram", {
        get: function() {
            return this.get("instagram");
        },
        set: function(value) {
            this.set("instagram", value);
        }
    });
    Object.defineProperty(SH.Shop.prototype, "lessFile", {
        get: function() {
            return this.get("lessFile");
        },
        set: function(value) {
            this.set("lessFile", value);
        }
    });
    Object.defineProperty(SH.Shop.prototype, "logo", {
        get: function() {
            return this.get("logo");
        },
        set: function(value) {
            this.set("logo", value);
        }
    });
    Object.defineProperty(SH.Shop.prototype, "menuTextColor", {
        get: function() {
            return this.get("menuTextColor");
        },
        set: function(value) {
            this.set("menuTextColor", value);
        }
    });
    Object.defineProperty(SH.Shop.prototype, "menuTextHoverColor", {
        get: function() {
            return this.get("menuTextHoverColor");
        },
        set: function(value) {
            this.set("menuTextHoverColor", value);
        }
    });
    Object.defineProperty(SH.Shop.prototype, "name", {
        get: function() {
            return this.get("name");
        },
        set: function(value) {
            this.set("name", value);
            this.set("subURL", value.toLowerCase());
        }
    });
    Object.defineProperty(SH.Shop.prototype, "navLayout", {
        get: function() {
            return this.get("navLayout");
        },
        set: function(value) {
            this.set("navLayout", value);
        }
    });
    Object.defineProperty(SH.Shop.prototype, "navStyle", {
        get: function() {
            return this.get("navStyle");
        },
        set: function(value) {
            this.set("navStyle", value);
        }
    });
    Object.defineProperty(SH.Shop.prototype, "owner", {
        get: function() {
            return this.get("owner");
        },
        set: function(value) {
            this.set("owner", value);
        }
    });
    Object.defineProperty(SH.Shop.prototype, "page", {
        get: function() {
            return this.get("page");
        },
        set: function(value) {
            this.set("page", value);
        }
    });
    Object.defineProperty(SH.Shop.prototype, "routing", {
        get: function() {
            return this.get("routing");
        },
        set: function(value) {
            this.set("routing", value);
        }
    });
    Object.defineProperty(SH.Shop.prototype, "wechat", {
        get: function() {
            return this.get("wechat");
        },
        set: function(value) {
            this.set("wechat", value);
        }
    });
    Object.defineProperty(SH.Shop.prototype, "pinterest", {
        get: function() {
            return this.get("pinterest");
        },
        set: function(value) {
            this.set("pinterest", value);
        }
    });
    Object.defineProperty(SH.Shop.prototype, "primaryColor", {
        get: function() {
            return this.get("primaryColor");
        },
        set: function(value) {
            this.set("primaryColor", value);
        }
    });
    Object.defineProperty(SH.Shop.prototype, "qq", {
        get: function() {
            return this.get("qq");
        },
        set: function(value) {
            this.set("qq", parseInt(value));
        }
    });
    Object.defineProperty(SH.Shop.prototype, "sinaWeibo", {
        get: function() {
            return this.get("sinaWeibo");
        },
        set: function(value) {
            this.set("sinaWeibo", value);
        }
    });
    Object.defineProperty(SH.Shop.prototype, "secondaryColor", {
        get: function() {
            return this.get("secondaryColor");
        },
        set: function(value) {
            this.set("secondaryColor", value);
        }
    });
    Object.defineProperty(SH.Shop.prototype, "subURL", {
        get: function() {
            return this.get("subURL");
        },
        set: function(value) {
            this.set("subURL", value.toLowerCase());
        }
    });
    Object.defineProperty(SH.Shop.prototype, "summary", {
        get: function() {
            return this.get("summary");
        },
        set: function(value) {
            if (value.length <= 140) {
                this.set("summary", value);
            }
        }
    });
    Object.defineProperty(SH.Shop.prototype, "tagline", {
        get: function() {
            return this.get("tagline");
        },
        set: function(value) {
            this.set("tagline", value);
        }
    });
    Object.defineProperty(SH.Shop.prototype, "twitter", {
        get: function() {
            return this.get("twitter");
        },
        set: function(value) {
            this.set("twitter", value);
        }
    });
    /**
     * Check if the currentShop is live online
     * @func SH.Shop.prototype.isLive
     * @example if (shop.isLive()) {
     *      //Shop is live
     * } else {
     *      //Shop is under development
     * }
     */
    SH.Shop.prototype.isLive = function() {
            return this.get("live");
        }
        /**
         * Check if the currentShop is live online
         * @func SH.Shop.prototype.getProductQuery
         * @example var productQuery = shop.getProductQuery();
         */
    SH.Shop.prototype.getProductQuery = function() {
            var query = new AV.Query(SH.Product);
            query.equalTo("shop", this);
            query.equalTo("status", SH.Product.STATUS_LISTING);
            query.include("imageArray");
            query.include("category");
            return query;
        }
        /**
         * Check if the currentShop is live online
         * @func SH.Shop.prototype.getCategoryQuery
         * @return {AV.Query} categoryQuery The query containing all categories for this shop
         * @example var categoryQuery = shop.getCategoryQuery();
         */
    SH.Shop.prototype.getCategoryQuery = function() {
            var query = this.relation("category").query();
            return query;
        }
        /**
         * Get query for all membership card that's associated with this shop
         * @func SH.Shop.prototype.getMembershipQuery
         * @example var membershipQuery = shop.getMembershipQuery();
         */
    SH.Shop.prototype.getMembershipQuery = function() {
            //Retrieve Membership
            var query = new AV.Query(SH.Membership);
            query.equalTo("shop", this);
            return query;
        }
        /**
         * Get the membership object that's with the user and this shop
         * @func SH.Shop.prototype.getMembership
         * @param {SH.User} user Target user shop has membership to
         * @param {Object} callback An object that has an optional success function, that takes no arguments and will be called on a successful push, and an error function that takes a AV.Error and will be called if the push failed.
         * @example shop.getMembership(user, {
         *      success: function(membership) {
         *          //Membership downloaded successfully
         *      },
         *      error: function(error) {
         *          //SH.showError(error);
         *      }
         * })
         * @see {@link https://leancloud.cn/docs/js_guide.html#查询条件}
         */
    SH.Shop.prototype.getMembership = function(user, callback) {
        //Retrieve Membership
        var query = new AV.Query(SH.Membership);
        query.equalTo("user", user);
        query.equalTo("shop", this);
        query.first(callback);
    }
}
},{}],13:[function(require,module,exports){
'use strict';

/**
 * Class for all Transaction object used in Shelf system
 * @class SH.Transaction
 * @memberof! <global>
 * @author Tianyi Li
 * @copyright SK8 PTY LTD 2015
 * @extends {AV.Object}
 * @see {@link https://leancloud.cn/docs/js_guide.html#对象 AV.Object}
 * @property {String} currency
 * @property {SH.User} payee
 * @property {SH.User} payer
 * @property {Int} priceInCent
 * @property {SH.Shop} shop
 * @property {String} summary
 * @property {SH.Purchase} purchase
 * @property {Int} status
 */
module.exports = function(SH, AV) {
  /**
   * Recommended way to
   * Initialize a new instance of the Class
   * @func SH.Transaction.prototype.new
   * @param {Object} [data] An json object that contains the data
   * @example var transaction = SH.Transaction.new({"id": "abcd");
   */
  SH.Transaction = AV.Object.extend("Transaction", {}, {});

  Object.defineProperty(SH.Transaction.prototype, "currency", {
    get: function() {
      return this.get("currency");
    },
    set: function(value) {
      this.set("currency", value);
    }
  });

  Object.defineProperty(SH.Transaction.prototype, "payee", {
    get: function() {
      return this.get("payee");
    },
    set: function(value) {
      this.set("payee", value);
    }
  });

  Object.defineProperty(SH.Transaction.prototype, "payer", {
    get: function() {
      return this.get("payer");
    },
    set: function(value) {
      this.set("payer", value);
    }
  });

  Object.defineProperty(SH.Transaction.prototype, "priceInCent", {
    get: function() {
      return this.get("priceInCent");
    },
    set: function(value) {
      this.set("priceInCent", value);
    }
  });

  Object.defineProperty(SH.Transaction.prototype, "shop", {
    get: function() {
      return this.get("shop");
    },
    set: function(value) {
      this.set("shop", value);
    }
  });

  Object.defineProperty(SH.Transaction.prototype, "shopId", {
    get: function() {
      return this.get("shopId");
    },
    set: function(value) {
      this.set("shopId", value);
    }
  });

  Object.defineProperty(SH.Transaction.prototype, "summary", {
    get: function() {
      return this.get("summary");
    },
    set: function(value) {
      this.set("summary", value);
    }
  });

  Object.defineProperty(SH.Transaction.prototype, "purchase", {
    get: function() {
      return this.get("purchase");
    },
    set: function(value) {
      this.set("purchase", value);
    }
  });
  Object.defineProperty(SH.Transaction.prototype, "status", {
    get: function() {
      return this.get("status");
    },
    set: function(value) {
      this.set("status", value);
    }
  });

  /**
   * @name SH.Transaction.STATUS_X
   * @description SH.Transaction.STATUS_X is the available status code describing the status of the transaction.
   * @property {int} STATUS_INITIALISE Status code indicating transaction has been initialised.
   * @property {int} STATUS_COMPLETE Status code indicating transaction is completed.
   * @property {int} STATUS_INCOMPLETE Status code indicating transaction is incompleted.

   */
  SH.Transaction.STATUS_INITIALISE = 0;
  SH.Transaction.STATUS_COMPLETE = 200;
  SH.Transaction.STATUS_INCOMPLETE = 990;

}
},{}],14:[function(require,module,exports){
'use strict';

/**
 * Class for all User object used in Shelf system
 * @class SH.User
 * @memberof! <global>
 * @author Xujie Song
 * @copyright SK8 PTY LTD 2015
 * @extends {AV.User}
 * @see {@link https://leancloud.cn/docs/js_guide.html#用户 AV.User}
 * @property {SH.Address} address The pointer of the default address of this _User
 * @property {Object} [authData] AuthData of this _User
 * @property {AV.File} [backgroundImage] BackgroundImage of this _User
 * @property {String} bio Bio of this _User
 * @property {String} email Email of this _User
 * @property {String} emailVerified EmailVerified of this _User
 * @property {Int} [installationId] InstallationId of this _User
 * @property {Int} messengerId MessengerId of this _User
 * @property {String} messengerToken MessengerToken of this _User
 * @property {String} mobileNumber MobileNumber of this _User
 * @property {String} mobilePhoneNumber MobileNumber of this _User
 * @property {Boolean} mobilePhoneVerified MobilePhoneVerified of this _User
 * @property {String} password Password of this _User
 * @property {AV.File} [profileImage] ProfileImage of this _User
 * @property {String} profileName ProfileName of this _User
 * @property {Float} rating The rating of this _User
 * @property {String} realName RealName of this _User
 * @property {String} username Username of this _User
 * @property {String} voipAccount VoipAccount of this _User
 * @property {String} voipPassword VoipPassword of this _User
 */
module.exports = function (SH, AV) {
    /**
     * Recommended way to
     * Initialize a new instance of the Class
     * @func SH.User.prototype.new
     * @param {Object} [data] An json object that contains the data
     * @example var user = SH.User.new({"id": "abcd");
     */
    SH.User = AV.Object.extend("_User", {
        //Instance variables
        //Instance functions
    }, {
        //Static variables
        //Static functions
    });
    Object.defineProperty(SH.User.prototype, "address", {
        get: function () {
            var address = this.get("address");
            if (address != undefined) {
                return address;
            } else {
                address = SH.Address.new();
                address.user = this;
                this.set("address", address);
                return address;
            }
        },
        set: function (value) {
            this.set("address", value);
        }
    });
    Object.defineProperty(SH.User.prototype, "authData", {
        get: function () {
            return this.get("authData");
        },
        set: function (value) {
            this.set("authData", value);
        }
    });
    Object.defineProperty(SH.User.prototype, "backgroundImage", {
        get: function () {
            return this.get("backgroundImage");
        },
        set: function (value) {
            this.set("backgroundImage", value);
        }
    });
    Object.defineProperty(SH.User.prototype, "bio", {
        get: function () {
            return this.get("bio");
        },
        set: function (value) {
            this.set("bio", value);
        }
    });
    Object.defineProperty(SH.User.prototype, "email", {
        get: function () {
            return this.get("email");
        },
        set: function (value) {
            this.set("email", value);
        }
    });
    Object.defineProperty(SH.User.prototype, "emailVerified", {
        get: function () {
            return this.get("emailVerified");
        },
        set: function (value) {
            this.set("emailVerified", value);
        }
    });
    Object.defineProperty(SH.User.prototype, "installationId", {
        get: function () {
            return this.get("installationId");
        },
        set: function (value) {
            this.set("installationId", value);
        }
    });
    Object.defineProperty(SH.User.prototype, "messengerId", {
        get: function () {
            return this.get("messengerId");
        },
        set: function (value) {
            this.set("messengerId", value);
        }
    });
    Object.defineProperty(SH.User.prototype, "messengerToken", {
        get: function () {
            return this.get("messengerToken");
        },
        set: function (value) {
            this.set("messengerToken", value);
        }
    });
    Object.defineProperty(SH.User.prototype, "mobileNumber", {
        get: function () {
            return this.get("mobileNumber");
        },
        set: function (value) {
            this.set("mobileNumber", value);
        }
    });
    Object.defineProperty(SH.User.prototype, "password", {
        get: function () {
            return this.get("password");
        },
        set: function (value) {
            this.set("password", value);
        }
    });
    Object.defineProperty(SH.User.prototype, "profileImage", {
        get: function () {
            return this.get("profileImage");
        },
        set: function (value) {
            this.set("profileImage", value);
        }
    });
    Object.defineProperty(SH.User.prototype, "profileName", {
        get: function () {
            return this.get("profileName");
        },
        set: function (value) {
            this.set("profileName", value);
        }
    });
    Object.defineProperty(SH.User.prototype, "rating", {
        get: function () {
            return this.get("rating");
        },
        set: function (value) {
            this.set("rating", parseFloat(value).toFixed(1));
        }
    });
    Object.defineProperty(SH.User.prototype, "realName", {
        get: function () {
            return this.get("realName");
        },
        set: function (value) {
            this.set("realName", value);
        }
    });
    Object.defineProperty(SH.User.prototype, "username", {
        get: function () {
            return this.get("username");
        },
        set: function (value) {
            this.set("username", value);
        }
    });
    Object.defineProperty(SH.User.prototype, "voipAccount", {
        get: function () {
            return this.get("voipAccount");
        },
        set: function (value) {
            this.set("voipAccount", value);
        }
    });
    Object.defineProperty(SH.User.prototype, "voipPassword", {
        get: function () {
            return this.get("voipPassword");
        },
        set: function (value) {
            this.set("voipPassword", value);
        }
    });
    /**
     * isUser method check if two user objects are equivalent to each other
     * @param {SH.User} user Target user to compare
     * @return {Boolean} boolean True if two users are the equivalent, false otherwise
     */
    SH.User.prototype.isUser = function (user) {
        if (user != undefined) {
            return this.id == user.id;
        } else {
            return false;
        }
    }
    /**
     * isUser method check if two user objects are equivalent to each other
     * @func SH.User.prototype.hasLikedProduct
     * @param {SH.Product} product Target product user wishes to like
     * @param {Object} callback An function with a boolean variable indicating if user had liked the product.
     * @see {@link https://leancloud.cn/docs/js_guide.html#保存对象 }
     * @example user.hasLikedProduct(product, function(liked) {
         *      if (liked) {
         *          //User had liked the product
         *      } else {
         *          User had not liked the product
         *      }
         * });
     * @return {Boolean} boolean True if two users are the equivalent, false otherwise
     */
    SH.User.prototype.hasLikedProduct = function (product, callback) {
        var query = this.getProductLikedRelation().query();
        var productId = product.id;
        query.equalTo("objectId", productId);
        query.count().then(function (count) {
            var liked = (count == 1);
            callback(liked);
        }, function (error) {
            callback(false);
        });
    }
    /**
     * Check if the user has verified his/her email
     * @func SH.User.prototype.hasVerifiedEmail
     * @example if (user.hasVerifiedEmail()) {
         *      //User had verified his/her email
         * } else {
         *      //User had not verified his/her email
         * }
     */
    SH.User.prototype.hasVerifiedEmail = function () {
        return this.get("emailVerified");
    }
    /**
     * Check if the user has verified his/her mobile number
     * @func SH.User.prototype.hasVerifiedMobileNumber
     * @example if (user.hasVerifiedMobileNumber()) {
         *      //User had verified his/her mobile number
         * } else {
         *      //User had not verified his/her mobile number
         * }
     */
    SH.User.prototype.hasVerifiedMobileNumber = function () {
        var mobileNumber = this.getMobileNumber();
        return mobileNumber != null;
    }
    /**
     * User like/dislike a particular product
     * @func SH.User.prototype.likeProduct
     * @param {SH.Product} product Target product user wishes to like
     * @param {Boolean} like True if user 'like 'the product, False if user 'dislike' it.
     * @param {Object} [callback] An object that has an optional success function, that takes no arguments and will be called on a successful push, and an error function that takes a AV.Error and will be called if the push failed.
     * @example user.likeProduct(product, like, {
         *          success: function(user) {
         *              //User liked/disliked the product
         *          },
         *          error: function(error) {
         *              //SH.showError(error);
         *          }
         * })
     */
    SH.User.prototype.likeProduct = function (product, like, callback) {
        var relation = this.getProductLikedRelation();
        if (like) {
            relation.add(product);
        } else {
            relation.remove(product);
        }
        this.save(callback);
        // Send a notification to the owner;
        var messsage = this.getProfileName() + " just liked your " + product.getName();
        // TODO
        SH.sendPush({
            cql: "select * from _Installation where user=" + this,
            data: {
                alert: messsage
            }
        });
    }
    /**
     * Get the membership object that's with the user and this shop
     * @func SH.User.prototype.getMembership
     * @param {SH.Shop} shop Target shop user has membership to
     * @param {Object} [callback] An object that has an optional success function, that takes no arguments and will be called on a successful push, and an error function that takes a AV.Error and will be called if the push failed.
     * @example user.getMembership(shop, {
         *          success: function(membership) {
         *              //Membership downloaded successfully
         *          },
         *          error: function(error) {
         *              //SH.showError(error);
         *          }
         *      })
     * @see {@link https://leancloud.cn/docs/js_guide.html#查询条件}
     */
    SH.User.prototype.getMembership = function (shop, callback) {
        //Retrieve Membership
        var query = new AV.Query(SH.Membership);
        query.equalTo("user", this);
        query.equalTo("shop", shop);
        query.first(callback);
    }
    /**
     * Get the relation to liked product
     * @func SH.User.prototype.getProductLikedRelation
     * @return {AV.Relation} relation The relation of liked product
     * @example var productLikedRelation = user.getProductLikedRelation();
     */
    SH.User.prototype.getProductLikedRelation = function () {
        return this.relation("productLiked");
    }
    /**
     * Get the relation to liked shop
     * @func SH.User.prototype.getShopLiked
     * @return {AV.Relation} relation The relation of liked shop
     * @example var shopFollowedRelation = user.getShopLiked();
     */
    SH.User.prototype.getShopLikedRelation = function () {
        return this.relation("shopLiked");
    }
    /**
     * Use the token return from Stripe, and update user
     * @func SH.User.prototype.updateCard
     * @param token
     * @see {@link https://stripe.com/docs/api/node#create_card}
     */
    SH.User.prototype.updateCard = function (token) {
        var params = {
            "tokenId": token.id
        };
        AV.Cloud.run('updateCard', params);
    }
    /**
     * Get the relation to all addresses
     * @func SH.User.prototype.getAddressRelation
     * @return {AV.Relation} relation The relation of all addresses
     * @example var addressRelation = user.getAddressRelation();
     */
    SH.User.prototype.getAddressRelation = function () {
        return this.relation("addressRelation");
    }
    /**
     * Add address to user address relation
     * @func SH.User.prototype.addAddress
     * @param {SH.Address} address
     */
    SH.User.prototype.addAddress = function (address) {
        this.getAddressRelation().add(address);
    }
    /**
     * Remove address from user address relation
     * @func SH.User.prototype.removeAddress
     * @param {SH.Address} address
     */
    SH.User.prototype.removeAddress = function (address) {
        this.getAddressRelation().remove(address);
    }
    /**
     * Subscribe to a particular shop
     * @func SH.User.prototype.subscribe
     * @param {SH.Shop} shop
     * @param {Object} [callback] An object that has an optional success function, that takes no arguments and will be called on a successful push, and an error function that takes a AV.Error and will be called if the push failed.
     * @example user.subscribe(shop, {
     *          success: function(user) {
     *              //Updated user
     *          },
     *          error: function(error) {
     *              //SH.showError(error);
     *          }
     *      });
     */
    SH.User.prototype.subscribe = function (shop, callback) {
        this.addUnique("subscribedShop", shop.id);
        this.save(callback);
    }
    /**
     * Follow to a particular user
     * @func SH.User.prototype.follow
     * @param {SH.User} user
     * @param {Object} [callback] An object that has an optional success function, that takes no arguments and will be called on a successful push, and an error function that takes a AV.Error and will be called if the push failed.
     * @example user.follow(user, {
     *          success: function(user) {
     *              //Updated user
     *          },
     *          error: function(error) {
     *              //SH.showError(error);
     *          }
     *      });
     */
    /**
     * Unfollow to a particular user
     * @func SH.User.prototype.unfollow
     * @param {SH.User} user
     * @param {Object} [callback] An object that has an optional success function, that takes no arguments and will be called on a successful push, and an error function that takes a AV.Error and will be called if the push failed.
     * @example user.unfollow(user, {
     *          success: function(user) {
     *              //Updated user
     *          },
     *          error: function(error) {
     *              //SH.showError(error);
     *          }
     *      });
     */
    /**
     * Create a followee query to query the user's followees.
     * @func SH.User.prototype.followeeQuery()
     * @example var followeeQuery = user.followeeQuery();
     */
    /**
     * Create a follower query to query the user's followers.
     * @func SH.User.prototype.followerQuery()
     * @example var followerQuery = user.followerQuery();
     */

    /**
     * Signs up a new user. You should call this instead of save for
     * new SH.Users. This will create a new SH.User on the server, and
     * also persist the session on disk so that you can access the user using
     * <code>current</code>.
     *
     * <p>A username and password must be set before calling signUp.</p>
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @func SH.User.signUp
     * @param {Object} attrs Extra fields to set on the new user, or null.
     * @param {Object} options A Backbone-style options object.
     * @return {AV.Promise} A promise that is fulfilled when the signup
     *     finishes.
     * @example
     *      var user = SH.User.new();
     *      user.username = "133342301@163.com";
     *      user.password = "abcdefg";
     *      user.signUp(null, {
     *        success: function(user) {
     *          // 注册成功，可以使用了.
     *        },
     *        error: function(user, error) {
     *          //SH.showError(error);
     *        }
     *      });
     */
    /**
     * Signs up a new user with mobile phone and sms code.
     * You should call this instead of save for
     * new AV.Users. This will create a new AV.User on the server, and
     * also persist the session on disk so that you can access the user using
     * <code>current</code>.
     *
     * <p>A username and password must be set before calling signUp.</p>
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @func SH.User.signUpOrlogInWithMobilePhone
     * @param {Object} attrs Extra fields to set on the new user, or null.
     * @param {Object} options A Backbone-style options object.
     * @return {AV.Promise} A promise that is fulfilled when the signup
     *     finishes.
     * @see @link https://leancloud.cn/docs/js_guide.html#手机号码一键登录 AV.Cloud.requestSmsCode}
     * @example
     *      var user = SH.User.new();
     *      user.username = "133342301@163.com";
     *      user.password = "abcdefg";
     *      user.signUpOrlogInWithMobilePhone({
     *        mobilePhoneNumber: '186xxxxxxxx',
     *        smsCode: '手机收到的 6 位验证码字符串',
     *        username: "feedback@sk8.asia",
     *        passwrod: "12345678"
     *        otherProperty: otherValue
     *      }, {
     *        success: function(user) {
     *          // 注册成功，可以使用了.
     *        },
     *        error: function(user, error) {
     *          //SH.showError(error);
     *        }
     *      });
     */

    /**
     * Logs in a user with a mobile phone number and password. On success, this
     * saves the session to disk, so you can retrieve the currently logged in
     * user using <code>current</code>.
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @func SH.User.logInWithMobilePhone
     * @param {String} mobilePhone The user's mobilePhoneNumber
     * @param {String} password The password to log in with.
     * @param {Object} options A Backbone-style options object.
     * @return {AV.Promise} A promise that is fulfilled with the user when
     *     the login completes.
     * @see @link https://leancloud.cn/docs/js_guide.html#手机号码和短信登录 AV.User.logInWithMobilePhone}
     * @example
     *      SH.User.logInWithMobilePhone('186xxxxxxxx', password, {
     *        success: function(user) {
     *          // 注册成功，可以使用了.
     *        },
     *        error: function(user, error) {
     *          //SH.showError(error);
     *        }
     *      });
     */

    /**
     * Logs out the currently logged in user session. This will remove the
     * session from disk, log out of linked services, and future calls to
     * <code>current</code> will return <code>null</code>.
     * @func SH.User.logOut
     * @example SH.User.logOut();
     */

    /**
     * Requests a password reset email to be sent to the specified email address
     * associated with the user account. This email allows the user to securely
     * reset their password on the AV site.
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @func SH.User.requestPasswordReset
     * @param {String} email The email address associated with the user that
     *     forgot their password.
     * @param {Object} options A Backbone-style options object.
     * @example
     *      SH.User.requestPasswordReset("email@example.com", {
     *        success: function() {
     *          // Password reset request was sent successfully
     *        },
     *        error: function(error) {
     *          //SH.showError(error);
     *      });
     */

    /**
     * Requests a verify email to be sent to the specified email address
     * associated with the user account. This email allows the user to securely
     * verify their email address on the AV site.
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @func SH.User.requestEmailVerify
     * @param {String} email The email address associated with the user that
     *     doesn't verify their email address.
     * @param {Object} options A Backbone-style options object.
     * @example
     *      SH.User.requestEmailVerify("email@example.com", {
     *        success: function() {
     *          // Verification email was sent successfully
     *        },
     *        error: function(error) {
     *          //SH.showError(error);
     *      });
     */

    /**
     * Requests a verify sms code to be sent to the specified mobile phone
     * number associated with the user account. This sms code allows the user to
     * verify their mobile phone number by calling AV.User.verifyMobilePhone
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @func SH.User.requestMobilePhoneVerify
     * @param {String} mobilePhone The mobile phone number  associated with the
     *                  user that doesn't verify their mobile phone number.
     * @param {Object} options A Backbone-style options object.
     * @exmaple
     *      AV.User.requestMobilePhoneVerify('186xxxxxxxx').then(function(){
     *        //发送成功
     *      }, function(err){
     *         //SH.showError(error);
     *      });
     */

    /**
     * Requests a reset password sms code to be sent to the specified mobile phone
     * number associated with the user account. This sms code allows the user to
     * reset their account's password by calling AV.User.resetPasswordBySmsCode
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @func SH.User.requestPasswordResetBySmsCode
     * @param {String} mobilePhone The mobile phone number  associated with the
     *                  user that doesn't verify their mobile phone number.
     * @param {Object} options A Backbone-style options object.
     * @example
     *      SH.User.requestPasswordResetBySmsCode("186xxxxxxxx", {
     *        success: function() {
     *          // Password reset request was sent successfully
     *        },
     *        error: function(error) {
     *          //SH.showError(error);
     *      });
     */
    /**
     * Makes a call to reset user's account password by sms code and new password.
     * The sms code is sent by AV.User.requestPasswordResetBySmsCode.
     * @func SH.User.resetPasswordBySmsCode
     * @param {String} code The sms code sent by AV.User.Cloud.requestSmsCode
     * @param {String} password The new password.
     * @param {Object} options A Backbone-style options object
     * @return {AV.Promise} A promise that will be resolved with the result
     * of the function.
     * @example
     *      SH.User.requestPasswordResetBySmsCode("123456", "newPassword", {
     *        success: function() {
     *          // Password reset request was sent successfully
     *        },
     *        error: function(error) {
     *          //SH.showError(error);
     *      });
     */
    /**
     * Makes a call to verify sms code that sent by AV.User.Cloud.requestSmsCode
     * If verify successfully,the user mobilePhoneVerified attribute will be true.
     * @func SH.User.verifyMobilePhone
     * @param {String} code The sms code sent by AV.User.Cloud.requestSmsCode
     * @param {Object} options A Backbone-style options object
     * @return {AV.Promise} A promise that will be resolved with the result
     * of the function.
     * @example
     *      SH.User.verifyMobilePhone("123456", {
     *        success: function() {
     *          // Password reset request was sent successfully
     *        },
     *        error: function(error) {
     *          //SH.showError(error);
     *      });
     */
    /**
     * Requests a logIn sms code to be sent to the specified mobile phone
     * number associated with the user account. This sms code allows the user to
     * login by AV.User.logInWithMobilePhoneSmsCode function.
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @func SH.User.requestLoginSmsCode
     * @param {String} mobilePhone The mobile phone number  associated with the
     *           user that want to login by AV.User.logInWithMobilePhoneSmsCode
     * @param {Object} options A Backbone-style options object.
     * @example
     *      SH.User.requestLoginSmsCode('186xxxxxxxx', {
     *        success: function() {
     *          // Password reset request was sent successfully
     *        },
     *        error: function(error) {
     *          //SH.showError(error);
     *      });
     */

    /**
     * Logs in a user with a mobile phone number and sms code sent by
     * AV.User.requestLoginSmsCode.On success, this
     * saves the session to disk, so you can retrieve the currently logged in
     * user using <code>current</code>.
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @func SH.User.logInWithMobilePhoneSmsCode
     * @param {String} mobilePhone The user's mobilePhoneNumber
     * @param {String} smsCode The sms code sent by AV.User.requestLoginSmsCode
     * @param {Object} options A Backbone-style options object.
     * @return {AV.Promise} A promise that is fulfilled with the user when
     *     the login completes.
     * @func SH.User#logIn
     * @example
     *      SH.User.logInWithMobilePhoneSmsCode("186xxxxxxxx", "123456", {
     *        success: function() {
     *          // Password reset request was sent successfully
     *        },
     *        error: function(error) {
     *          //SH.showError(error);
     *      });
     */

    /**
     * Logs in a AV.User. On success, this saves the session to localStorage,
     * so you can retrieve the currently logged in user using
     * <code>current</code>.
     *
     * <p>A username and password must be set before calling logIn.</p>
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @func SH.User.prototype.logIn
     * @param {Object} options A Backbone-style options object.
     * @func SH.User.logIn
     * @return {AV.Promise} A promise that is fulfilled with the user when
     *     the login is complete.
     * @example
     *      AV.User.logIn("myUsername", "myPassword", {
     *        success: function(user) {
     *          // 成功了，现在可以做其他事情了.
     *        },
     *        error: function(user, error) {
     *          //SH.showError(error);
     *        }
     *      });
     */

    /**
     * Update user's new password safely based on old password.
     * @func SH.User.prototype
     * @param {String} oldPassword, the old password.
     * @param {String} newPassword, the new password.
     * @param {Object} An optional Backbone-like options object with
     *     success and error callbacks that will be invoked once the iteration
     *     has finished.
     * @example
     *      var user = AV.User.current();
     *      user.updatePassword('currentPassword', 'newPassword', {
     *        success: function(){
     *          //更新成功
     *        },
     *        error: function(user, err){
     *          //SH.showError(error);
     *        }
     *      });
     */

    /**
     * Logs in a user with a session token. On success, this saves the session
     * to disk, so you can retrieve the currently logged in user using
     * <code>current</code>.
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @func SH.User.become
     * @param {String} sessionToken The sessionToken to log in with.
     * @param {Object} options A Backbone-style options object.
     * @return {AV.Promise} A promise that is fulfilled with the user when
     *     the login completes.
     * @example
     *      SH.User.become("sessionToken", {
     *        success: function(){
     *          //更新成功
     *        },
     *        error: function(user, err){
     *          //SH.showError(error);
     *        }
     *      });
     */
}
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LW1pZGRsZXdhcmUvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNlcnZlci9zaGVsZl9ub2RlL2RvY3MuanMiLCJzZXJ2ZXIvc2hlbGZfbm9kZS9zcmMvU0guanMiLCJzZXJ2ZXIvc2hlbGZfbm9kZS9zcmMvU0hBZGRyZXNzLmpzIiwic2VydmVyL3NoZWxmX25vZGUvc3JjL1NIQ2F0ZWdvcnkuanMiLCJzZXJ2ZXIvc2hlbGZfbm9kZS9zcmMvU0hDb21tZW50LmpzIiwic2VydmVyL3NoZWxmX25vZGUvc3JjL1NIRXJyb3IuanMiLCJzZXJ2ZXIvc2hlbGZfbm9kZS9zcmMvU0hNZW1iZXJzaGlwLmpzIiwic2VydmVyL3NoZWxmX25vZGUvc3JjL1NIUGFnZS5qcyIsInNlcnZlci9zaGVsZl9ub2RlL3NyYy9TSFByb2R1Y3QuanMiLCJzZXJ2ZXIvc2hlbGZfbm9kZS9zcmMvU0hQdXJjaGFzZS5qcyIsInNlcnZlci9zaGVsZl9ub2RlL3NyYy9TSFB1cmNoYXNlRW50cnkuanMiLCJzZXJ2ZXIvc2hlbGZfbm9kZS9zcmMvU0hTaG9wLmpzIiwic2VydmVyL3NoZWxmX25vZGUvc3JjL1NIVHJhbnNhY3Rpb24uanMiLCJzZXJ2ZXIvc2hlbGZfbm9kZS9zcmMvU0hVc2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBTaGVsZiBpcyBhIHV0aWxpdHkgY2xhc3MgZm9yIGFwcHMgZW1wb3dlcmVkIGZvciBTaGVsZlxyXG4vLyBBdXRob3I6IFh1amllIFNvbmdcclxuLy8gQ29weXJpZ2h0OiBTSzggUFRZIExURFxyXG4vLyBWMC45LjZcclxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgU0ggPSBmdW5jdGlvbigpIHt9XHJcblxyXG52YXIgQVYgPSBmdW5jdGlvbigpIHt9XHJcblxyXG5yZXF1aXJlKCcuL3NyYy9TSC5qcycpKFNILCBBVik7XHJcbnJlcXVpcmUoJy4vc3JjL1NIRXJyb3IuanMnKShTSCwgQVYpO1xyXG5yZXF1aXJlKCcuL3NyYy9TSEFkZHJlc3MuanMnKShTSCwgQVYpO1xyXG5yZXF1aXJlKCcuL3NyYy9TSENhdGVnb3J5LmpzJykoU0gsIEFWKTtcclxucmVxdWlyZSgnLi9zcmMvU0hDb21tZW50LmpzJykoU0gsIEFWKTtcclxucmVxdWlyZSgnLi9zcmMvU0hNZW1iZXJzaGlwLmpzJykoU0gsIEFWKTtcclxucmVxdWlyZSgnLi9zcmMvU0hQYWdlLmpzJykoU0gsIEFWKTtcclxucmVxdWlyZSgnLi9zcmMvU0hQcm9kdWN0LmpzJykoU0gsIEFWKTtcclxucmVxdWlyZSgnLi9zcmMvU0hQdXJjaGFzZS5qcycpKFNILCBBVik7XHJcbnJlcXVpcmUoJy4vc3JjL1NIUHVyY2hhc2VFbnRyeS5qcycpKFNILCBBVik7XHJcbnJlcXVpcmUoJy4vc3JjL1NIU2hvcC5qcycpKFNILCBBVik7XHJcbnJlcXVpcmUoJy4vc3JjL1NIVXNlci5qcycpKFNILCBBVik7XHJcbnJlcXVpcmUoJy4vc3JjL1NIVHJhbnNhY3Rpb24uanMnKShTSCwgQVYpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTSDsiLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU0ggaXMgdGhlIGZ1bmRhbWVudGFsIGZ1bmN0aW9uIGZvciBTaGVsZiBMaWJyYXJ5LiBBbGwgc3ViY2xhc3NlcyBvciBtZXRob2RzIHdpbGwgc3RhcnQgd2l0aCB0aGlzIGZ1bmN0aW9uLlxuICogQGNsYXNzIFNIXG4gKiBAYXV0aG9yIFh1amllIFNvbmdcbiAqIEBjb3B5cmlnaHQgKGMpIFNLOCBQVFkgTFREIDIwMTUuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBAc2VlIHtAbGluayBodHRwczovL2xlYW5jbG91ZC5jbi9kb2NzL2xlYW5lbmdpbmVfZ3VpZGUtbm9kZS5odG1sIExlYW5FbmdpbmUgUmVmZXJlbmNlfVxuICogQHRvZG8gUmVzb2x2ZSBkZXBsb3kgZXJyb3IgJ1VuYXV0aG9yaXplZCdcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihTSCwgQVYpIHtcbiAgU0guQVYgPSBBVjtcblxuICAvKipcbiAgICogSW5pdGlhdGlvbiBtZXRob2QgZm9yIFNoZWxmIEFwcFxuICAgKiBAZnVuYyBTSC5pbml0aWFsaXplXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzaG9wSWQgVGhlIGlkIG9mIHRoZSBTaG9wLiBVc3VhbGx5IGxpbmsgd291bGQgbG9vayBsaWtlIGh0dHA6Ly9zaG9wSWQuc2hlbGYuaXNcbiAgICogQHBhcmFtIHtPYmplY3R9IGNhbGxiYWNrIEFuIG9iamVjdCB0aGF0IGhhcyBhbiBvcHRpb25hbCBzdWNjZXNzIGZ1bmN0aW9uLCB0aGF0IHRha2VzIG5vIGFyZ3VtZW50cyBhbmQgd2lsbCBiZSBjYWxsZWQgb24gYSBzdWNjZXNzZnVsIHB1c2gsIGFuZCBhbiBlcnJvciBmdW5jdGlvbiB0aGF0IHRha2VzIGEgQVYuRXJyb3IgYW5kIHdpbGwgYmUgY2FsbGVkIGlmIHRoZSBwdXNoIGZhaWxlZC5cbiAgICogQGV4YW1wbGUgU0guaW5pdGlhbGl6ZShcImFiY2RTaG9wSWRcIiwge1xuICAgKiAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihzaG9wKSB7XG4gICAqICAgICAgICAgICAgICAvLyRyb290U2NvcGUuY3VycmVudFNob3AgPSBTSC5jdXJyZW50U2hvcDtcbiAgICogICAgICAgICAgICAgIC8vJHJvb3RTY29wZS5jdXJyZW50U2VsbGVyID0gU0guY3VycmVudFNob3Aub3duZXI7XG4gICAqICAgICAgICAgICAgICAvLyRyb290U2NvcGUuY3VycmVudFVzZXIgPSBTSC5jdXJyZW50VXNlcjtcbiAgICogICAgICAgICAgICAgIC8vJHNjb3BlLnJlbG9hZFNob3Aoc2hvcCk7XG4gICAqICAgICAgICAgIH0sXG4gICAqICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuICAgKiAgICAgICAgICAgICAgU0guc2hvd0Vycm9yKGVycm9yKTtcbiAgICogICAgICAgICAgfVxuICAgKiB9KTtcbiAgICovXG4gIFNILmluaXRpYWxpemUgPSBmdW5jdGlvbihzaG9wSWQsIGNhbGxiYWNrKSB7XG5cbiAgICAvL0RlZmF1bHQgc2V0dGluZ3NcbiAgICB2YXIgU1RSSVBFX1BVQkxJQ19LRVkgPSBcInBrX2xpdmVfMTNNazA4dkVYbVZQWHYwZ3VvRlFPZXl3XCI7XG4gICAgdmFyIFNUUklQRV9QVUJMSUNfVEVTVF9LRVkgPSBcInBrX3Rlc3RfWXdFaE90czNhRWNHMUNCZHpndDlrSGpRXCI7XG4gICAgXG4gICAgLyoqXG4gICAgICogRG8gbm90IHJlbW92ZSwgZm9yIEZ1dHVyZSBJTSBVc2FnZVxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICovXG4gICAgLy8gdmFyIFlUWF9BQ0NPVU5UX1NJRCA9IFwiXCI7XG4gICAgLy8gdmFyIFlUWF9BQ0NPVU5UX0FVVEhfVE9LRU4gPSBcIlwiO1xuICAgIC8vIHZhciBZVFhfQVBQX0lEID0gXCJcIjtcbiAgICAvKiogXG4gICAgICogVmVyaWZpY2F0aW9uIGNvZGUgZm9yIG1vYmlsZSBudW1iZXIgdmVyaWZpY2F0aW9uXG4gICAgICogQHR5cGUge0ludH0gdmVyaWZpY2F0aW9uQ29kZSA2IGRpZ2l0IG51bWJlclxuICAgICAqL1xuICAgIHZhciB2ZXJpZmljYXRpb25Db2RlID0gMDtcbiAgICAvKipcbiAgICAgKiBDdXN0b20gVmFyaWFibGVzIHJlcXVpcmVkIGJ5IFNoZWxmIExpYnJhcnksIGJ1dCBpcyBkZXBlbmRlbnQgb24gRW5kIEFwcCAgXG4gICAgICogU2V0IHRoZW0gaW4gaW5pdGlhbGl6ZSgpIG1ldGhvZFxuICAgICAqL1xuICAgIC8vIHZhciBPUkFOR0VfUFJJTUFSWSA9IFwiI2ZmNjYwMFwiO1xuICAgIC8vIHZhciBPUkFOR0VfU0VDT05EQVJZID0gXCIjZmY5OTMzXCI7XG4gICAgLy8gdmFyIFdISVRFID0gXCIjZmZmZmZmXCI7XG4gICAgLy8gdmFyIEdSRVlfTElHSFRFU1QgPSBcIiNmN2Y3ZjdcIjtcbiAgICAvLyB2YXIgR1JFWSA9IFwiI2RkZGRkZFwiO1xuICAgIC8vIHZhciBHUkVZX0RBUktFU1QgPSBcIiM3Nzc3NzdcIjtcbiAgICAvLyB2YXIgQkxBQ0sgPSBcIiMyMjIyMjJcIjtcbiAgICAvLyBTSC5wcmltYXJ5Q29sb3IgPSBcIiMzMzk5MDBcIjtcbiAgICAvLyBTSC5zZWNvbmRhcnlDb2xvciA9IFwiIzk5Q0MzM1wiO1xuICAgIC8vIFNILnByaW1hcnlDb2xvclJldmVyc2UgPSBcIiNGRjY2MDBcIjtcbiAgICAvLyBTSC5ncmV5ID0gXCIjNjY2NjY2XCI7XG4gICAgLy8gU0gud2hpdGVQcmltYXJ5ID0gXCIjRkNGREY5XCI7XG4gICAgLy8gU0gud2hpdGVTZWNvbmRhcnkgPSBcIiNERkRERERcIjtcbiAgICAvL1N0YXRpYyB2YXJpYWJsZXMgZm9yIGVhc3kgdXNlXG5cbiAgICAvKipcbiAgICAgKiBEb3dubG9hZCB0aGUgY29ycmVzcG9uZGluZyBzaG9wXG4gICAgICovXG4gICAgdmFyIHF1ZXJ5ID0gbmV3IEFWLlF1ZXJ5KFNILlNob3ApO1xuICAgIHF1ZXJ5LmVxdWFsVG8oXCJzdWJVUkxcIiwgc2hvcElkKTtcbiAgICBxdWVyeS5pbmNsdWRlKFwib3duZXJcIik7XG4gICAgcXVlcnkuaW5jbHVkZShcImFkZHJlc3NcIik7XG4gICAgcXVlcnkuaW5jbHVkZShcImNhdGVnb3J5XCIpO1xuICAgIHF1ZXJ5LmZpcnN0KHtcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHNob3ApIHtcbiAgICAgICAgLy9yZXNldCBkeW5hbWljIHJvdXRpbmdcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIlN0YXJ0aW5nIHJvdXRpbmcgXCIgKyBzaG9wLm5hbWUgKyBzaG9wLnJvdXRpbmdbXCJob21lXCJdW1wicm91dGVcIl0pO1xuICAgICAgICBTSC5jdXJyZW50U2hvcCA9IHNob3A7XG4gICAgICAgIFNILmN1cnJlbnRTZWxsZXIgPSBzaG9wLm93bmVyO1xuICAgICAgICAvL1NhdmUgY3VycmVudCB1c2VyXG4gICAgICAgIGlmIChTSC5Vc2VyLmN1cnJlbnQoKSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBTSC5jdXJyZW50VXNlciA9IFNILlVzZXIuY3VycmVudCgpO1xuICAgICAgICAgIGNhbGxiYWNrLnN1Y2Nlc3Moc2hvcCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgU0gubG9nb3V0KHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgICAgU0guY3VycmVudFVzZXIgPSB1c2VyO1xuICAgICAgICAgICAgICBjYWxsYmFjay5zdWNjZXNzKHNob3ApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgICAgICBjYWxsYmFjay5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgY2FsbGJhY2suZXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIC8qKlxuICAgICAqIERPIE5PVCBSRU1PVkUhIVxuICAgICAqIEZvciBmdXR1cmUgdXNhZ2UsIGZldGNoaW5nIGN1cnJlbnQgbG9jYXRpb25cbiAgICAgKi9cbiAgICAvLyBpZiAobmF2aWdhdG9yLmdlb2xvY2F0aW9uKSB7XG4gICAgLy8gICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oZnVuY3Rpb24gKHBvc2l0aW9uKSB7XG4gICAgLy8gICAgICAgICBTSC5jdXJyZW50TG9jYXRpb24gPSBwb3NpdGlvbjtcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gfVxuXG4gIH07XG4gIC8qKlxuICAgKiBMb2dvdXQgdGhlIGN1cnJlbnRVc2VyIGFuZCBDcmVhdGUgYSBuZXcgQW5vbnltb3VzIHVzZXIgXG4gICAqIEBmdW5jIFNILmxvZ291dFxuICAgKiBAcGFyYW0ge09iamVjdH0gW2NhbGxiYWNrXSBBbiBvYmplY3QgdGhhdCBoYXMgYW4gb3B0aW9uYWwgc3VjY2VzcyBmdW5jdGlvbiwgdGhhdCB0YWtlcyBubyBhcmd1bWVudHMgYW5kIHdpbGwgYmUgY2FsbGVkIG9uIGEgc3VjY2Vzc2Z1bCBwdXNoLCBhbmQgYW4gZXJyb3IgZnVuY3Rpb24gdGhhdCB0YWtlcyBhIEFWLkVycm9yIGFuZCB3aWxsIGJlIGNhbGxlZCBpZiB0aGUgcHVzaCBmYWlsZWQuXG4gICAqIEBzZWUge0BsaW5rIGxlYW5jbG91ZC5jbi9kb2NzL3Jlc3RfYXBpLmh0bWwgfVxuICAgKiBAZXhhbXBsZSBTSC5sb2dvdXQoe1xuICAgKiAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG4gICAqICAgICAgICAgICAgICAvL1VzZXIgbG9nZ2VkIG91dCwgcmV0dXJuIHdpdGggdGhlIG5ldyBhbm9ueW1vdXMgdXNlclxuICAgKiAgICAgICAgICB9LFxuICAgKiAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICogICAgICAgICAgICAgIC8vU0guc2hvd0Vycm9yKGVycm9yKTtcbiAgICogICAgICAgICAgfVxuICAgKiAgICAgIH0pO1xuICAgKiBAdG9kbyBUZXN0IGlmIHRoZSBmdW5jdGlvbiBpcyB3b3JraW5nXG4gICAqL1xuICBTSC5sb2dvdXQgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgU0guVXNlci5sb2dPdXQoKTtcbiAgICAgIFNILmNyZWF0ZUFub255bW91c1VzZXIoe1xuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgLy8kcm9vdFNjb3BlLmN1cnJlbnRVc2VyID0gcmVzdWx0O1xuICAgICAgICAgIHZhciBzZXNzaW9uVG9rZW4gPSB1c2VyLnNlc3Npb25Ub2tlbjtcbiAgICAgICAgICBTSC5Vc2VyLmJlY29tZShzZXNzaW9uVG9rZW4sIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHUpIHtcbiAgICAgICAgICAgICAgY2FsbGJhY2suc3VjY2Vzcyh1KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgICAgY2FsbGJhY2suZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3IpIHtcbiAgICAgICAgICBjYWxsYmFjay5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDbGVhciB0aGUgY3VycmVudCBwdXJjaGFzZSwgYW5kIGNyZWF0ZSBhIG5ldyBTSC5QdXJjaGFzZSBpbnN0YW5jZSBmb3IgdGhlIGN1cnJlbnQgdXNlclxuICAgICAqIEBmdW5jIFNILmNsZWFyQ3VycmVudFB1cmNoYXNlXG4gICAgICovXG4gIFNILmNsZWFyQ3VycmVudFB1cmNoYXNlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcHVyY2hhc2UgPSBTSC5QdXJjaGFzZS5uZXcoKTtcbiAgICAgIHB1cmNoYXNlLnN0YXR1cyA9IFNILlB1cmNoYXNlLlNUQVRVU19JTklUSUFURUQ7XG4gICAgICBwdXJjaGFzZS5idXllciA9IFNILmN1cnJlbnRVc2VyO1xuICAgICAgU0guY3VycmVudFB1cmNoYXNlID0gcHVyY2hhc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBhbm9ueW1vdXMgdXNlciB2aWEgUkVTVCBBUEkgPGJyPlxuICAgICAqIENhbiBiZSBpbnRlZ3JhdGVkIHdpdGggUkVTVCBBUEkgbG9naW4gPGJyPlxuICAgICAqIEBmdW5jIFNILmNyZWF0ZUFub255bW91c1VzZXJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW2NhbGxiYWNrXSBBbiBvYmplY3QgdGhhdCBoYXMgYW4gb3B0aW9uYWwgc3VjY2VzcyBmdW5jdGlvbiwgdGhhdCB0YWtlcyBubyBhcmd1bWVudHMgYW5kIHdpbGwgYmUgY2FsbGVkIG9uIGEgc3VjY2Vzc2Z1bCBwdXNoLCBhbmQgYW4gZXJyb3IgZnVuY3Rpb24gdGhhdCB0YWtlcyBhIEFWLkVycm9yIGFuZCB3aWxsIGJlIGNhbGxlZCBpZiB0aGUgcHVzaCBmYWlsZWQuXG4gICAgICogQGV4YW1wbGUgU0guY3JlYXRlQW5vbnltb3VzVXNlcih7XG4gICAgICogICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuICAgICAqICAgICAgICAgICAgICAvL0FjY2VzcyB1c2VyIGhlcmVcbiAgICAgKiAgICAgICAgICB9LFxuICAgICAqICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuICAgICAqICAgICAgICAgICAgICAvL1NILnNob3dFcnJvcihlcnJvcik7XG4gICAgICogICAgICAgICAgfVxuICAgICAqIH0pO1xuICAgICAqIEBzZWUge0BsaW5rIGh0dHBzOi8vbGVhbmNsb3VkLmNuL2RvY3MvanNfZ3VpZGUuaHRtbCPnu5HlrprnrKzkuInmlrnlubPlj7DotKbmiLd9XG4gICAgICovXG4gIFNILmNyZWF0ZUFub255bW91c1VzZXIgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgLyoqXG4gICAgICAgKiBnZW5lcmF0ZSAxOCBkaWdpdHMgaGV4IHN0cmluZ1xuICAgICAgICogQGZ1bmMgU0guUXVlcnkuZ2VuZXJhdGVSYW5kb21JZFxuICAgICAgICogQHBhcmFtIHtTdHJpbmd9IDE4IGRpZ2l0cyBoZXggbnVtYmVyXG4gICAgICAgKi9cbiAgICAgIHZhciBnZW5lcmF0ZVJhbmRvbUlkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtaW4gPSAxMDAwMDAwMDAwMDAwMDAwMDAwMDtcbiAgICAgICAgdmFyIG1heCA9IDk5OTk5OTk5OTk5OTk5OTk5OTk5O1xuICAgICAgICB2YXIgcmFuZG9tID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbjtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHJhbmRvbS50b1N0cmluZygxNik7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgICB2YXIgaWQgPSBnZW5lcmF0ZVJhbmRvbUlkKCk7XG4gICAgICB2YXIgdXJsID0gXCJodHRwczovL2FwaS5sZWFuY2xvdWQuY24vMS4xL3VzZXJzXCI7XG4gICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgYXV0aERhdGE6IHtcbiAgICAgICAgICBhbm9ueW1vdXM6IHtcbiAgICAgICAgICAgIGlkOiBpZFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIHhtbGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgIHhtbGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh4bWxodHRwLnJlYWR5U3RhdGUgPT0gNCAmJiAoeG1saHR0cC5zdGF0dXMgPT0gMjAwIHx8IHhtbGh0dHAuc3RhdHVzID09IDIwMSkpIHtcbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiByZXN1bHQoVXNlcikgd2lsbCBiZSBhIEpTIE9iamVjdFxuICAgICAgICAgICAqIGtleTogdXNlcm5hbWVcbiAgICAgICAgICAgKiBrZXk6IHNlc3Npb25Ub2tlblxuICAgICAgICAgICAqIGtleTogY3JlYXRlZEF0XG4gICAgICAgICAgICoga2V5OiBvYmplY3RJZFxuICAgICAgICAgICAqL1xuICAgICAgICAgIHZhciBteUFyciA9IEpTT04ucGFyc2UoeG1saHR0cC5yZXNwb25zZVRleHQpO1xuICAgICAgICAgIC8vQ2hlY2sgZm9yIHVuZGVmaW5lZCwgcHJldmVudGluZyB0aGUgcmVzdCBvZiBjb2RlIHRvIGNyYXNoXG4gICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjay5zdWNjZXNzKG15QXJyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoeG1saHR0cC5yZWFkeVN0YXRlID09IDQgJiYgeG1saHR0cC5zdGF0dXMgIT0gMjAxICYmIHhtbGh0dHAuc3RhdHVzICE9IDIwMCkge1xuICAgICAgICAgIC8vQ2hlY2sgZm9yIHVuZGVmaW5lZCwgcHJldmVudGluZyB0aGUgcmVzdCBvZiBjb2RlIHRvIGNyYXNoXG4gICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjay5lcnJvcih7XG4gICAgICAgICAgICAgIFwibWVzc2FnZVwiOiBcInN0YXRlOiBcIiArIHhtbGh0dHAuc3RhdHVzICsgXCIgfCBcIiArIHhtbGh0dHAucmVhZHlTdGF0ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB4bWxodHRwLm9wZW4oJ1BPU1QnLCB1cmwsIHRydWUpO1xuICAgICAgeG1saHR0cC5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcbiAgICAgIHhtbGh0dHAuc2V0UmVxdWVzdEhlYWRlcihcIlgtTEMtSWRcIiwgU0guQVBQX0lEKTtcblxuICAgIC8qKlxuICAgICAqIFVzZSBMQy1TaWduLCByZXF1aXJlIG1kNVxuICAgICAqL1xuICAgICAgLy92YXIgdGltZXN0YW1wID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAvL3ZhciBzaWduID0gbWQ1KHRpbWVzdGFtcCArIFNILkFwcF9LZXkpO1xuICAgICAgLy94bWxodHRwLnNldFJlcXVlc3RIZWFkZXIoXCJYLUxDLVNpZ25cIiwgc2lnbiArIFwiLFwiICsgdGltZXN0YW1wKTtcbiAgICAgIC8veG1saHR0cC5zZXRSZXF1ZXN0SGVhZGVyKFwiZGF0YS11cmxlbmNvZGVcIiwgdGhpcy5jcWwpO1xuICAgICAgeG1saHR0cC5zZXRSZXF1ZXN0SGVhZGVyKFwiWC1MQy1LZXlcIiwgU0guQVBQX0tFWSk7XG5cbiAgICB4bWxodHRwLnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTaG93IGFuIHByb21vdGUgdG8gdXNlciwgaXQncyBjdXJyZW50bHkgYW4gYWxlcnQuXG4gICAgICogQGZ1bmMgU0guUHJvbW90ZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlIFRoZSBtZXNzYWdlIHlvdSB3aXNoIHRvIHByb21vdGVcbiAgICAgKiBAZXhhbXBsZSBTSC5wcm9tb3RlKFwiU2hlbGYgaXMgYXdlc29tZSFcIik7XG4gICAgICovXG4gIFNILnByb21vdGUgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICBTSC5sb2cobWVzc2FnZSk7XG4gICAgICB3aW5kb3cuYWxlcnQobWVzc2FnZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIExvZyB0aGUgZXJyb3IgbWVzc2FnZSBpbiBjb25zb2xlLCBhbmQgJ3Byb21vdGUnIGl0IHRvIHVzZXJcbiAgICAgKiBAZnVuYyBTSC5zaG93RXJyb3JcbiAgICAgKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBIVFRQIEVycm9yXG4gICAgICogQGV4YW1wbGUgU0guc2hvd0Vycm9yKGVycm9yKTtcbiAgICAgKi9cbiAgU0guc2hvd0Vycm9yID0gZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgIFNILmxvZyhlcnJvci5tZXNzYWdlKTtcbiAgICAgIHdpbmRvdy5hbGVydChlcnJvci5tZXNzYWdlKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogY3VzdG9tIFNILmxvZyBmdW5jdGlvbi5cbiAgICAgKiBAZnVuYyBTSC5sb2dcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZSBUaGUgbWVzc2FnZSB5b3Ugd2lzaCB0byBsb2dcbiAgICAgKiBAZXhhbXBsZSBTSC5sb2cobWVzc2FnZSk7XG4gICAgICovXG4gIFNILmxvZyA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZW5kIGFuIFNNUyB0byB0aGUgZ2l2ZW4gcmVjZWl2ZXJcbiAgICAgKiBAZnVuYyBTSC5zZW5kU01TXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtcyAtIFRoZSBkYXRhIG9mIHRoZSBTTVMuIFZhbGlkIGZpZWxkcyBhcmU6IDxicj5cbiAgICAgKiAgICAgcmVjZWl2ZXIgLSBBIFN0cmluZyBmb3IgdGhlIHJlY2VpdmVyJ3MgcGhvbmUgYWRkcmVzcywgaW5jbHVkaW5nIHRoZSBjb3VudHJ5IGNvZGUuIDxicj5cbiAgICAgKiAgICAgbWVzc2FnZSAtIEEgU3RyaW5nIGZvciB0aGUgbWVzc2FnZSB0byBiZSBzZW50LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbY2FsbGJhY2tdIEFuIG9iamVjdCB0aGF0IGhhcyBhbiBvcHRpb25hbCBzdWNjZXNzIGZ1bmN0aW9uLCB0aGF0IHRha2VzIG5vIGFyZ3VtZW50cyBhbmQgd2lsbCBiZSBjYWxsZWQgb24gYSBzdWNjZXNzZnVsIHB1c2gsIGFuZCBhbiBlcnJvciBmdW5jdGlvbiB0aGF0IHRha2VzIGEgQVYuRXJyb3IgYW5kIHdpbGwgYmUgY2FsbGVkIGlmIHRoZSBwdXNoIGZhaWxlZC5cbiAgICAgKiBAc2VlIHtAbGluayBodHRwczovL3d3dy50d2lsaW8uY29tL2RvY3MvYXBpIFR3aWxpbyBBUEl9XG4gICAgICogQGV4YW1wbGUgU0guc2VuZFNNUyh7XG4gICAgICogICAgICAgICAgbWVzc2FnZTogXCJTaGVsZiBpcyBhd2Vzb21lIVwiLFxuICAgICAqICAgICAgICAgIHJlY2VpdmVyOiBcIis2MTQ0OTg0MzE0OVwiXG4gICAgICogICAgICB9LCB7XG4gICAgICogICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAqICAgICAgICAgICAgICAvL1NNUyBzZW50IHN1Y2Nlc3NmdWxseVxuICAgICAqICAgICAgICAgIH0sXG4gICAgICogICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICogICAgICAgICAgICAgIC8vU0guc2hvd0Vycm9yKGVycm9yKTtcbiAgICAgKiAgICAgICAgICB9XG4gICAgICogICAgICB9KTtcbiAgICAgKiBAdG9kbyBUZXN0IGlmIHRoZSBmdW5jdGlvbiBpcyB3b3JraW5nXG4gICAgICovXG4gIFNILnNlbmRTTVMgPSBmdW5jdGlvbihkYXRhLCBjYWxsYmFjaykge1xuICAgICAgQVYuQ2xvdWQucnVuKCdzZW5kU01TJywgcGFyYW1zLCBjYWxsYmFjayk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNlbmQgYW4gRW1haWwgdG8gdGhlIGdpdmVuIHJlY2VpdmVyXG4gICAgICogQGZ1bmMgU0guc2VuZEVtYWlsXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtcyAtIFRoZSBkYXRhIG9mIHRoZSBlbWFpbC4gVmFsaWQgZmllbGRzIGFyZTogPGJyPlxuICAgICAqICAgICBuYW1lIC0gQSBTdHJpbmcgZm9yIHRoZSBzZW5kZXIncyBuYW1lLiA8YnI+XG4gICAgICogICAgIGVtYWlsIC0gQSBTdHJpbmcgZm9yIHRoZSBzZW5kZXIncyBlbWFpbCBhZGRyZXNzLiA8YnI+XG4gICAgICogICAgIHJlY2VpdmVyIC0gQSBTdHJpbmcgZm9yIHRoZSByZWNlaXZlcidzIGVtYWlsIGFkZHJlc3MuIDxicj5cbiAgICAgKiAgICAgc3ViamVjdCAtIEEgU3RyaW5nIGZvciB0aGUgc3ViamVjdCBvZiB0aGUgZW1haWwuIDxicj5cbiAgICAgKiAgICAgbWVzc2FnZSAtIEEgU3RyaW5nIGZvciB0aGUgbWVzc2FnZSB0byBiZSBzZW50LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbY2FsbGJhY2tdIEFuIG9iamVjdCB0aGF0IGhhcyBhbiBvcHRpb25hbCBzdWNjZXNzIGZ1bmN0aW9uLCB0aGF0IHRha2VzIG5vIGFyZ3VtZW50cyBhbmQgd2lsbCBiZSBjYWxsZWQgb24gYSBzdWNjZXNzZnVsIHB1c2gsIGFuZCBhbiBlcnJvciBmdW5jdGlvbiB0aGF0IHRha2VzIGEgQVYuRXJyb3IgYW5kIHdpbGwgYmUgY2FsbGVkIGlmIHRoZSBwdXNoIGZhaWxlZC5cbiAgICAgKiBAc2VlIHtAbGluayBodHRwczovL2RvY3VtZW50YXRpb24ubWFpbGd1bi5jb20vIE1haWxndW4gQVBJfVxuICAgICAqIEBleGFtcGxlIFNILnNlbmRFbWFpbCh7XG4gICAgICogICAgICAgICAgJ25hbWUnOiBcIkphY2tcIixcbiAgICAgKiAgICAgICAgICAnZW1haWwnOiBcImphY2tAc2s4LmFzaWFcIixcbiAgICAgKiAgICAgICAgICAncmVjZWl2ZXInOiBcImZlZWRiYWNrQHNrOC5hc2lhXCIsXG4gICAgICogICAgICAgICAgJ3N1YmplY3QnOiBcIlNoZWxmIEVucXVpcnlcIixcbiAgICAgKiAgICAgICAgICAnbWVzc2FnZSc6IFwiU2hlbGYgaXMgQXdlc29tZSFcIlxuICAgICAqICAgICAgfSwge1xuICAgICAqICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgKiAgICAgICAgICAgICAgLy9FbWFpbCBzZW50IHN1Y2Nlc3NmdWxseVxuICAgICAqICAgICAgICAgIH0sXG4gICAgICogICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICogICAgICAgICAgICAgIC8vU0guc2hvd0Vycm9yKGVycm9yKTtcbiAgICAgKiAgICAgICAgICB9XG4gICAgICogICAgICB9KTtcbiAgICAgKiBAdG9kbyBUZXN0IGlmIHRoZSBmdW5jdGlvbiBpcyB3b3JraW5nXG4gICAgICovXG4gIFNILnNlbmRFbWFpbCA9IGZ1bmN0aW9uKHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICAgIEFWLkNsb3VkLnJ1bignc2VuZEVtYWlsJywgcGFyYW1zLCBjYWxsYmFjayk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNlbmQgYW4gUHVzaCBOb3RpZmljYXRpb24gdG8gdGhlIGdpdmVuIHJlY2VpdmVyXG4gICAgICogQGZ1bmMgU0guc2VuZFB1c2hcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zIC0gVGhlIGRhdGEgb2YgdGhlIHB1c2ggbm90aWZpY2F0aW9uLiBWYWxpZCBmaWVsZHMgYXJlOiA8YnI+XG4gICAgICogICAgIGNoYW5uZWxzIC0gQW4gQXJyYXkgb2YgY2hhbm5lbHMgdG8gcHVzaCB0by4gPGJyPlxuICAgICAqICAgICBwdXNoX3RpbWUgLSBBIERhdGUgb2JqZWN0IGZvciB3aGVuIHRvIHNlbmQgdGhlIHB1c2guIDxicj5cbiAgICAgKiAgICAgZXhwaXJhdGlvbl90aW1lIC0gQSBEYXRlIG9iamVjdCBmb3Igd2hlbiB0byBleHBpcmUgdGhlIHB1c2guIDxicj5cbiAgICAgKiAgICAgZXhwaXJhdGlvbl9pbnRlcnZhbCAtIFRoZSBzZWNvbmRzIGZyb20gbm93IHRvIGV4cGlyZSB0aGUgcHVzaC4gPGJyPlxuICAgICAqICAgICB3aGVyZSAtIEEgQVYuUXVlcnkgb3ZlciBBVi5JbnN0YWxsYXRpb24gdGhhdCBpcyB1c2VkIHRvIG1hdGNoIGEgc2V0IG9mIGluc3RhbGxhdGlvbnMgdG8gcHVzaCB0by4gPGJyPlxuICAgICAqICAgICBjcWwgLSBBIENRTCBzdGF0ZW1lbnQgb3ZlciBBVi5JbnN0YWxsYXRpb24gdGhhdCBpcyB1c2VkIHRvIG1hdGNoIGEgc2V0IG9mIGluc3RhbGxhdGlvbnMgdG8gcHVzaCB0by4gPGJyPlxuICAgICAqICAgICBkYXRhIC0gVGhlIGRhdGEgdG8gc2VuZCBhcyBwYXJ0IG9mIHRoZSBwdXNoXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtjYWxsYmFja10gQW4gb2JqZWN0IHRoYXQgaGFzIGFuIG9wdGlvbmFsIHN1Y2Nlc3MgZnVuY3Rpb24sIHRoYXQgdGFrZXMgbm8gYXJndW1lbnRzIGFuZCB3aWxsIGJlIGNhbGxlZCBvbiBhIHN1Y2Nlc3NmdWwgcHVzaCwgYW5kIGFuIGVycm9yIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYSBBVi5FcnJvciBhbmQgd2lsbCBiZSBjYWxsZWQgaWYgdGhlIHB1c2ggZmFpbGVkLlxuICAgICAqIEBzZWUge0BsaW5rIGh0dHBzOi8vbGVhbmNsb3VkLmNuL2RvY3MvanNfcHVzaC5odG1sI0RlbW9f5Y+K56S65L6L5Luj56CBIH1cbiAgICAgKiBAZXhhbXBsZSBTSC5zZW5kUHVzaCh7XG4gICAgICogICAgICAgICAgLy8gY2hhbm5lbHM6IFsnYWFhJ10sXG4gICAgICogICAgICAgICAgZGF0YToge21lc3NhZ2U6IFwiU2hlbGYgaXMgQXdlc29tZSFcIn1cbiAgICAgKiAgICAgIH0sIHtcbiAgICAgKiAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICogICAgICAgICAgICAgIC8vUHVzaCBzZW50IHN1Y2Nlc3NmdWxseVxuICAgICAqICAgICAgICAgIH0sXG4gICAgICogICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICogICAgICAgICAgICAgIC8vU0guc2hvd0Vycm9yKGVycm9yKTtcbiAgICAgKiAgICAgICAgICB9XG4gICAgICogICAgICB9KTtcbiAgICAgKiBAdG9kbyBUZXN0IGlmIHRoZSBmdW5jdGlvbiBpcyB3b3JraW5nXG4gICAgICovXG4gIFNILnNlbmRQdXNoID0gZnVuY3Rpb24ocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgdmFyIHB1c2ggPSBBVi5wdXNoKHtcbiAgICAgICAgYXBwSWQ6IEFWX0FwcF9JZCxcbiAgICAgICAgYXBwS2V5OiBBVl9BcHBfS2V5XG4gICAgICB9KTtcbiAgICAgIHB1c2guc2VuZChwYXJhbXMsIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogT3BlbiB0aGUgdXJsIGluIGEgbmV3IHRhYlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBVUkwgVVJMIG9mIHRoZSB3ZWJzaXRlXG4gICAgICovXG4gIFNILm9wZW5VUkwgPSBmdW5jdGlvbih1cmwpIHtcbiAgICB3aW5kb3cub3Blbih1cmwsICdfYmxhbmsnLCAncmVzaXphYmxlPXllcycpO1xuICB9XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENsYXNzIGZvciBhbGwgYWRkcmVzcyBvYmplY3QgdXNlZCBpbiBTaGVsZiBzeXN0ZW1cbiAqIEBjbGFzcyBTSC5BZGRyZXNzXG4gKiBAbWVtYmVyb2YhIDxnbG9iYWw+XG4gKiBAYXV0aG9yIFh1amllIFNvbmdcbiAqIEBjb3B5cmlnaHQgKGMpIFNLOCBQVFkgTFREIDIwMTUuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBAZXh0ZW5kcyB7QVYuT2JqZWN0fVxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9sZWFuY2xvdWQuY24vZG9jcy9qc19ndWlkZS5odG1sI+WvueixoSBBVi5PYmplY3R9XG4gKiBAcHJvcGVydHkge1N0cmluZ30gY2l0eSBDaXR5IG9mIHRoaXMgYWRkcmVzc1xuICogQHByb3BlcnR5IHtTdHJpbmd9IGNvbnRhY3ROdW1iZXIgQ29udGFjdCBOdW1iZXJcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBjb3VudHJ5IENvdW50cnkgb2YgdGhpcyBhZGRyZXNzXG4gKiBAcHJvcGVydHkge0FWLkdlb1BvaW50fSBnZW9Qb2ludCBHZW8gUG9pbnQgb2YgdGhpcyBhZGRyZXNzXG4gKiBAcHJvcGVydHkge2ludH0gcG9zdGFsQ29kZSBQb3N0Y29kZSBvZiB0aGlzIGFkZHJlc3NcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSByZWNpcGllbnQgUmVjaXBpZW50IG9mIHRoaXMgYWRkcmVzc1xuICogQHByb3BlcnR5IHtTdHJpbmd9IHN0YXRlIFN0YXRlIG9mIHRoaXMgYWRkcmVzc1xuICogQHByb3BlcnR5IHtTdHJpbmd9IHN0cmVldEFkZHJlc3MgU3RyZWV0QWRkcmVzcyBvZiB0aGlzIGFkZHJlc3NcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSB1c2VySWQgVGhlIGlkIG9mIHRoZSBvd25lciBvZiB0aGlzIGFkZHJlc3NcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihTSCwgQVYpIHtcbiAgICAvKipcbiAgICAgKiBSZWNvbW1lbmRlZCB3YXkgdG9cbiAgICAgKiBJbml0aWFsaXplIGEgbmV3IGluc3RhbmNlIG9mIHRoZSBDbGFzc1xuICAgICAqIEBmdW5jIFNILkFkZHJlc3MucHJvdG90eXBlLm5ld1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbZGF0YV0gQW4ganNvbiBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgZGF0YVxuICAgICAqIEBleGFtcGxlIHZhciBhZGRyZXNzID0gU0guQWRkcmVzcy5uZXcoe1wiaWRcIjogXCJhYmNkXCIpO1xuICAgICAqL1xuICAgIFNILkFkZHJlc3MgPSBBVi5PYmplY3QuZXh0ZW5kKFwiQWRkcmVzc1wiLCB7XG4gICAgICAgIC8vSW5zdGFuY2UgdmFyaWFibGVzXG4gICAgICAgIC8vSW5zdGFuY2UgZnVuY3Rpb25zXG4gICAgfSwge1xuICAgICAgICAvL1N0YXRpYyB2YXJpYWJsZXNcbiAgICAgICAgLy9TdGF0aWMgZnVuY3Rpb25zXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILkFkZHJlc3MucHJvdG90eXBlLCBcImNpdHlcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwiY2l0eVwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJjaXR5XCIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5BZGRyZXNzLnByb3RvdHlwZSwgXCJjb250YWN0TnVtYmVyXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldChcImNvbnRhY3ROdW1iZXJcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwiY29udGFjdE51bWJlclwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guQWRkcmVzcy5wcm90b3R5cGUsIFwiY291bnRyeVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJjb3VudHJ5XCIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldChcImNvdW50cnlcIiwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILkFkZHJlc3MucHJvdG90eXBlLCBcImdlb1BvaW50XCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldChcImdlb1BvaW50XCIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldChcImdlb1BvaW50XCIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5BZGRyZXNzLnByb3RvdHlwZSwgXCJwb3N0YWxDb2RlXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldChcInBvc3RhbENvZGVcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwicG9zdGFsQ29kZVwiLCBwYXJzZUludCh2YWx1ZSkpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILkFkZHJlc3MucHJvdG90eXBlLCBcInJlY2lwaWVudFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJyZWNpcGllbnRcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwicmVjaXBpZW50XCIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5BZGRyZXNzLnByb3RvdHlwZSwgXCJzdGF0ZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJzdGF0ZVwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJzdGF0ZVwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guQWRkcmVzcy5wcm90b3R5cGUsIFwic3RyZWV0QWRkcmVzc1wiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJzdHJlZXRBZGRyZXNzXCIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldChcInN0cmVldEFkZHJlc3NcIiwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILkFkZHJlc3MucHJvdG90eXBlLCBcInVzZXJJZFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJ1c2VySWRcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwidXNlcklkXCIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xufSIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDbGFzcyBmb3IgYWxsIGNhdGVnb3J5IG9iamVjdCB1c2VkIGluIFNoZWxmIHN5c3RlbVxuICogQGNsYXNzIFNILkNhdGVnb3J5XG4gKiBAbWVtYmVyb2YhIDxnbG9iYWw+XG4gKiBAYXV0aG9yIFh1amllIFNPbmdcbiAqIEBjb3B5cmlnaHQgU0s4IFBUWSBMVEQgMjAxNVxuICogQGV4dGVuZHMge0FWLk9iamVjdH1cbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vbGVhbmNsb3VkLmNuL2RvY3MvanNfZ3VpZGUuaHRtbCPlr7nosaEgQVYuT2JqZWN0fVxuICogQHByb3BlcnR5IHtTdHJpbmd9IG5hbWUgTmFtZSBvZiB0aGlzIENhdGVnb3J5XG4gKiBAcHJvcGVydHkge0FWLkZpbGV9IGltYWdlIEltYWdlIG9mIHRoaXMgQ2F0ZWdvcnlcbiAqIEBwcm9wZXJ0eSB7U0guQ2F0ZWdvcnl9IHBhcmVudENhdGVnb3J5IFBhcmVudCBjYXRlZ29yeSBvZiB0aGlzIENhdGVnb3J5XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oU0gsIEFWKSB7XG4gICAgLyoqXG4gICAgICogUmVjb21tZW5kZWQgd2F5IHRvXG4gICAgICogSW5pdGlhbGl6ZSBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgQ2xhc3NcbiAgICAgKiBAZnVuYyBTSC5DYXRlZ29yeS5wcm90b3R5cGUubmV3XG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtkYXRhXSBBbiBqc29uIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSBkYXRhXG4gICAgICogQGV4YW1wbGUgdmFyIGNhdGVnb3J5ID0gU0guQ2F0ZWdvcnkubmV3KHtcImlkXCI6IFwiYWJjZFwiKTtcbiAgICAgKi9cbiAgICBTSC5DYXRlZ29yeSA9IEFWLk9iamVjdC5leHRlbmQoXCJDYXRlZ29yeVwiLCB7XG4gICAgICAgIC8vSW5zdGFuY2UgdmFyaWFibGVzXG4gICAgICAgIC8vSW5zdGFuY2UgZnVuY3Rpb25zXG4gICAgfSwge1xuICAgICAgICAvL1N0YXRpYyB2YXJpYWJsZXNcbiAgICAgICAgLy9TdGF0aWMgZnVuY3Rpb25zXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILkNhdGVnb3J5LnByb3RvdHlwZSwgXCJuYW1lXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJuYW1lXCIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJuYW1lXCIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5DYXRlZ29yeS5wcm90b3R5cGUsIFwiaW1hZ2VcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldChcImltYWdlXCIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJpbWFnZVwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guQ2F0ZWdvcnkucHJvdG90eXBlLCBcInBhcmVudENhdGVnb3J5XCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJwYXJlbnRDYXRlZ29yeVwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwicGFyZW50Q2F0ZWdvcnlcIiwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfSk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENsYXNzIGZvciBhbGwgY29tbWVudCBvYmplY3QgdXNlZCBpbiBTaGVsZiBzeXN0ZW1cbiAqIEBjbGFzcyBTSC5Db21tZW50XG4gKiBAbWVtYmVyb2YhIDxnbG9iYWw+XG4gKiBAYXV0aG9yIFh1amllIFNvbmdcbiAqIEBjb3B5cmlnaHQgU0s4IFBUWSBMVEQgMjAxNVxuICogQGV4dGVuZHMge0FWLk9iamVjdH1cbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vbGVhbmNsb3VkLmNuL2RvY3MvanNfZ3VpZGUuaHRtbCPlr7nosaEgQVYuT2JqZWN0fVxuICogQHByb3BlcnR5IHtTSC5Qcm9kdWN0fSBwcm9kdWN0IFByb2R1Y3Qgb2YgdGhpcyBDb21tZW50XG4gKiBAcHJvcGVydHkge1NILlVzZXJ9IHNlbmRlciBTZW5kZXIgb2YgdGhpcyBDb21tZW50XG4gKiBAcHJvcGVydHkge1N0cmluZ30gdGV4dCBUZXh0IG9mIHRoaXMgQ29tbWVudFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKFNILCBBVikge1xuICAgIC8qKlxuICAgICAqIFJlY29tbWVuZGVkIHdheSB0b1xuICAgICAqIEluaXRpYWxpemUgYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIENsYXNzXG4gICAgICogQGZ1bmMgU0guQ29tbWVudC5wcm90b3R5cGUubmV3XG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtkYXRhXSBBbiBqc29uIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSBkYXRhXG4gICAgICogQGV4YW1wbGUgdmFyIGNvbW1lbnQgPSBTSC5Db21tZW50Lm5ldyh7XCJpZFwiOiBcImFiY2RcIik7XG4gICAgICovXG4gICAgU0guQ29tbWVudCA9IEFWLk9iamVjdC5leHRlbmQoXCJDb21tZW50XCIsIHtcbiAgICAgICAgLy9JbnN0YW5jZSB2YXJpYWJsZXNcbiAgICAgICAgLy9JbnN0YW5jZSBmdW5jdGlvbnNcbiAgICB9LCB7XG4gICAgICAgIC8vU3RhdGljIHZhcmlhYmxlc1xuICAgICAgICAvL1N0YXRpYyBmdW5jdGlvbnNcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guQ29tbWVudC5wcm90b3R5cGUsIFwicHJvZHVjdFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJwcm9kdWN0XCIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldChcInByb2R1Y3RcIiwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILkNvbW1lbnQucHJvdG90eXBlLCBcInNlbmRlclwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJzZW5kZXJcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwic2VuZGVyXCIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5Db21tZW50LnByb3RvdHlwZSwgXCJ0ZXh0XCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldChcInRleHRcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwidGV4dFwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXRpbGl0eSBFcnJvciBGdW5jdGlvbiwgZGVjbGFyZSBzeXN0ZW0gZXJyb3JzIGhlcmVcbiAqIEBmdW5jIFNILkVycm9yXG4gKiBAYXV0aG9yIFh1amllIFNvbmdcbiAqIEBjb3B5cmlnaHQgU0s4IFBUWSBMVEQgMjAxNVxuICogQHBhcmFtIHtJbnR9IEVycm9yIFRoZSBlcnJvciBjb2RlXG4gKiBAcmV0dXJuIHtTdHJpbmd9IEVycm9yIGRlc2NyaXB0aW9uXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oU0gsIEFWKSB7XG4gICAgU0guRXJyb3IgPSBmdW5jdGlvbiAoRXJyb3IpIHtcbiAgICAgICAgdmFyIEVycm9yQ29kZSA9IFwiIEVycm9yOiBcIiArIChcIjAwMFwiICsgRXJyb3IpLnNsaWNlKC00KTtcbiAgICAgICAgc3dpdGNoIChFcnJvcikge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIC8vIEEgdXNlciAoU0hVc2VyKSBvYmplY3QgaXMgcmVxdWlyZWQgYmVmb3JlIHNhdmluZyBhbiBTSEFkZHJlc3Mgb2JqZWN0XG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIkFkZHJlc3MgaXMgbWlzc2luZyB1c2VyLlwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2UgKyBFcnJvckNvZGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgLy8gQSByZWNpcGllbnQgKFN0cmluZykgaXMgcmVxdWlyZWQgYmVmb3JlIHNhdmluZyBhbiBTSEFkZHJlc3Mgb2JqZWN0XG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIkFkZHJlc3MgaXMgbWlzc2luZyByZWNpcGllbnQuXCJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZSArIEVycm9yQ29kZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAvLyBBIGNvbnRhY3ROdW1iZXIgKFN0cmluZykgaXMgcmVxdWlyZWQgYmVmb3JlIHNhdmluZyBhbiBTSEFkZHJlc3Mgb2JqZWN0XG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIkFkZHJlc3MgaXMgbWlzc2luZyBjb250YWN0IG51bWJlci5cIlxuICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlICsgRXJyb3JDb2RlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIC8vIEEgc3RyZWV0QWRkcmVzcyAoU3RyaW5nKSBpcyByZXF1aXJlZCBiZWZvcmUgc2F2aW5nIGFuIFNIQWRkcmVzcyBvYmplY3RcbiAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZSA9IFwiQWRkcmVzcyBpcyBtaXNzaW5nIHN0cmVldCBhZGRyZXNzLlwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2UgKyBFcnJvckNvZGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgLy8gQSBjaXR5IChTdHJpbmcpIGlzIHJlcXVpcmVkIGJlZm9yZSBzYXZpbmcgYW4gU0hBZGRyZXNzIG9iamVjdFxuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gXCJBZGRyZXNzIGlzIG1pc3NpbmcgY2l0eS5cIlxuICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlICsgRXJyb3JDb2RlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgICAgIC8vIEEgc3RhdGUgKFN0cmluZykgaXMgcmVxdWlyZWQgYmVmb3JlIHNhdmluZyBhbiBTSEFkZHJlc3Mgb2JqZWN0XG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIkFkZHJlc3MgaXMgbWlzc2luZyBzdGF0ZS5cIlxuICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlICsgRXJyb3JDb2RlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgICAgIC8vIEEgY291bnRyeSAoU3RyaW5nKSBpcyByZXF1aXJlZCBiZWZvcmUgc2F2aW5nIGFuIFNIQWRkcmVzcyBvYmplY3RcbiAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZSA9IFwiQWRkcmVzcyBpcyBtaXNzaW5nIGNvdW50cnkuXCJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZSArIEVycm9yQ29kZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNzpcbiAgICAgICAgICAgICAgICAvLyBBIHBvc3RhbENvZGUgKE51bWJlcikgaXMgcmVxdWlyZWQgYmVmb3JlIHNhdmluZyBhbiBTSEFkZHJlc3Mgb2JqZWN0XG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIkFkZHJlc3MgaXMgbWlzc2luZyBwb3N0YWwgY29kZS5cIlxuICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlICsgRXJyb3JDb2RlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICAgICAgICAvLyBBIG5hbWUgKFN0cmluZykgaXMgcmVxdWlyZWQgYmVmb3JlIHNhdmluZyBhbiBTSENhdGVnb3J5IG9iamVjdFxuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gXCJDYXRlZ29yeSBpcyBtaXNzaW5nIG5hbWUuXCJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZSArIEVycm9yQ29kZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjA6XG4gICAgICAgICAgICAgICAgLy8gQSB1c2VyIChTSFVzZXIpIGlzIHJlcXVpcmVkIGJlZm9yZSBzYXZpbmcgYW4gU0hDb21tZW50IG9iamVjdFxuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gXCJDb21tZW50IGlzIG1pc3NpbmcgdXNlci5cIlxuICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlICsgRXJyb3JDb2RlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyMTpcbiAgICAgICAgICAgICAgICAvLyBBIHByb2R1Y3QgKFNIUHJvZHVjdCkgaXMgcmVxdWlyZWQgYmVmb3JlIHNhdmluZyBhbiBTSENvbW1lbnQgb2JqZWN0XG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIkNvbW1lbnQgaXMgbWlzc2luZyBwcm9kdWN0LlwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2UgKyBFcnJvckNvZGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDIyOlxuICAgICAgICAgICAgICAgIC8vIEEgdGV4dCAoU3RyaW5nKSBpcyByZXF1aXJlZCBiZWZvcmUgc2F2aW5nIGFuIFNIQ29tbWVudCBvYmplY3RcbiAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZSA9IFwiQ29tbWVudCBpcyBtaXNzaW5nIHRleHQuXCJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZSArIEVycm9yQ29kZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzA6XG4gICAgICAgICAgICAgICAgLy8gQSBzaG9wIChTSC5TaG9wKSBpcyByZXF1aXJlZCBiZWZvcmUgc2F2aW5nIGFuIFNITWVtYmVyc2hpcCBvYmplY3RcbiAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZSA9IFwiTWVtYmVyc2hpcCBpcyBtaXNzaW5nIHRhcmdldCBzaG9wLlwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2UgKyBFcnJvckNvZGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDMxOlxuICAgICAgICAgICAgICAgIC8vIEEgdXNlciAoU0hVc2VyKSBpcyByZXF1aXJlZCBiZWZvcmUgc2F2aW5nIGFuIFNITWVtYmVyc2hpcCBvYmplY3RcbiAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZSA9IFwiTWVtYmVyc2hpcCBpcyBtaXNzaW5nIHRhcmdldCB1c2VyLlwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2UgKyBFcnJvckNvZGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDQwOlxuICAgICAgICAgICAgICAgIC8vIEEgY2F0ZWdvcnkgKFNIQ2F0ZWdvcnkpIGlzIHJlcXVpcmVkIGJlZm9yZSBzYXZpbmcgYW4gU0hQcm9kdWN0IG9iamVjdFxuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gXCJQcm9kdWN0IGlzIG1pc3NpbmcgY2F0ZWdvcnkuXCJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZSArIEVycm9yQ29kZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNDE6XG4gICAgICAgICAgICAgICAgLy8gQSBjb3ZlciBpbWFnZSAoQVZGaWxlKSBpcyByZXF1aXJlZCBiZWZvcmUgc2F2aW5nIGFuIFNIUHJvZHVjdCBvYmplY3RcbiAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZSA9IFwiUHJvZHVjdCBpcyBtaXNzaW5nIGNvdmVyIGltYWdlLlwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2UgKyBFcnJvckNvZGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDQyOlxuICAgICAgICAgICAgICAgIC8vIEEgY3VycmVuY3kgKFN0cmluZykgaXMgcmVxdWlyZWQgYmVmb3JlIHNhdmluZyBhbiBTSFByb2R1Y3Qgb2JqZWN0XG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIlByb2R1Y3QgaXMgbWlzc2luZyBjdXJyZW5jeS5cIlxuICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlICsgRXJyb3JDb2RlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0MzpcbiAgICAgICAgICAgICAgICAvLyBBIHByaWNlIChmbG9hdCkgaXMgcmVxdWlyZWQgYmVmb3JlIHNhdmluZyBhbiBTSFByb2R1Y3Qgb2JqZWN0XG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIlByb2R1Y3QgaXMgbWlzc2luZyBwcmljZS5cIlxuICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlICsgRXJyb3JDb2RlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0NDpcbiAgICAgICAgICAgICAgICAvLyBBIG5hbWUgKFN0cmluZykgaXMgcmVxdWlyZWQgYmVmb3JlIHNhdmluZyBhbiBTSFByb2R1Y3Qgb2JqZWN0XG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIlByb2R1Y3QgaXMgbWlzc2luZyBuYW1lLlwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2UgKyBFcnJvckNvZGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDQ1OlxuICAgICAgICAgICAgICAgIC8vIFByb2R1Y3QgcHJpY2UgY2Fubm90IGJlICQwLjAwXG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIlByb2R1Y3QgcHJpY2UgY2Fubm90IGJlICQwLjAwLlwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2UgKyBFcnJvckNvZGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDQ2OlxuICAgICAgICAgICAgICAgIC8vIEEgc2VsbGVyIChTSFVzZXIpIGlzIHJlcXVpcmVkIGJlZm9yZSBzYXZpbmcgYW4gU0hQcm9kdWN0IG9iamVjdFxuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gXCJQcm9kdWN0IGlzIG1pc3Npbmcgc2VsbGVyLlwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2UgKyBFcnJvckNvZGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDUwOlxuICAgICAgICAgICAgICAgIC8vIEEgYnV5ZXIgKFNIVXNlcikgaXMgcmVxdWlyZWQgYmVmb3JlIHNhdmluZyBhbiBTSFB1cmNoYXNlIG9iamVjdFxuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gXCJQdXJjaGFzZSBpcyBtaXNzaW5nIGJ1eWVyLlwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2UgKyBFcnJvckNvZGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDUxOlxuICAgICAgICAgICAgICAgIC8vIEEgZGVsaXZlcnlBZGRyZXNzIChTSEFkZHJlc3MpIGlzIHJlcXVpcmVkIGJlZm9yZSBzYXZpbmcgYW4gU0hQdXJjaGFzZSBvYmplY3RcbiAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZSA9IFwiUHVyY2hhc2UgaXMgbWlzc2luZyBkZWxpdmVyeSBhZGRyZXNzLlwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2UgKyBFcnJvckNvZGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDUyOlxuICAgICAgICAgICAgICAgIC8vIEEgdG90YWxQcmljZUluQ2VudCAoaW50KSBpcyByZXF1aXJlZCBiZWZvcmUgc2F2aW5nIGFuIFNIUHVyY2hhc2Ugb2JqZWN0XG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIlB1cmNoYXNlIGlzIG1pc3NpbmcgdG90YWwgcHJpY2UuXCJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZSArIEVycm9yQ29kZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNTM6XG4gICAgICAgICAgICAgICAgLy8gdG90YWxQcmljZUluQ2VudCBjYW5ub3QgYmUgMFxuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gXCJUb3RhbCBjYW5ub3QgYmUgJDAuMDAgZm9yIGEgcHVyY2hhc2UuXCJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZSArIEVycm9yQ29kZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNTQ6XG4gICAgICAgICAgICAgICAgLy8gQSBkZXNjcmlwdGlvbiAoU3RyaW5nKSBpcyByZXF1aXJlZCBiZWZvcmUgc2F2aW5nIGFuIFNIUHVyY2hhc2Ugb2JqZWN0XG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIlB1cmNoYXNlIGlzIG1pc3NpbmcgZGVzY3JpcHRpb24uXCJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZSArIEVycm9yQ29kZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNTU6XG4gICAgICAgICAgICAgICAgLy8gQSBjdXJyZW5jeSAoU3RyaW5nKSBpcyByZXF1aXJlZCBiZWZvcmUgc2F2aW5nIGFuIFNIUHVyY2hhc2Ugb2JqZWN0XG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIlB1cmNoYXNlIGlzIG1pc3NpbmcgY3VycmVuY3kgZGV0YWlsLlwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2UgKyBFcnJvckNvZGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDQ1OlxuICAgICAgICAgICAgICAgIC8vIEEgY3VycmVuY3kgKFN0cmluZykgaXMgcmVxdWlyZWQgYmVmb3JlIHNhdmluZyBhbiBTSFB1cmNoYXNlIG9iamVjdFxuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gXCJQdXJjaGFzZSBpcyBtaXNzaW5nIGN1cnJlbmN5IGRldGFpbC5cIlxuICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlICsgRXJyb3JDb2RlO1xuICAgICAgICAgICAgY2FzZSA0NjpcbiAgICAgICAgICAgICAgICAvLyBBIHRva2VuIChTdHJpbmcpIGlzIHJlcXVpcmVkIGJlZm9yZSBzYXZpbmcgYW4gU0hQdXJjaGFzZSBvYmplY3RcbiAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZSA9IFwiUHVyY2hhc2UgaXMgbWlzc2luZyBwYXltZW50IGRldGFpbC5cIlxuICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlICsgRXJyb3JDb2RlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2MDpcbiAgICAgICAgICAgICAgICAvLyBBIGJ1eWVyIChTSFVzZXIpIGlzIHJlcXVpcmVkIGJlZm9yZSBzYXZpbmcgYW4gU0hQdXJjaGFzZUVudHJ5IG9iamVjdFxuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gXCJQdXJjaGFzZUVudHJ5IGlzIG1pc3NpbmcgYnV5ZXIuXCJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZSArIEVycm9yQ29kZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjE6XG4gICAgICAgICAgICAgICAgLy8gQSBzZWxsZXIgKFNIVXNlcikgaXMgcmVxdWlyZWQgYmVmb3JlIHNhdmluZyBhbiBTSFB1cmNoYXNlRW50cnkgb2JqZWN0XG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIlB1cmNoYXNlRW50cnkgaXMgbWlzc2luZyBzZWxsZXIuXCJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZSArIEVycm9yQ29kZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjI6XG4gICAgICAgICAgICAgICAgLy8gQSBwcm9kdWN0IChTSFByb2R1Y3QpIGlzIHJlcXVpcmVkIGJlZm9yZSBzYXZpbmcgYW4gU0hQdXJjaGFzZUVudHJ5IG9iamVjdFxuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gXCJQdXJjaGFzZUVudHJ5IGlzIG1pc3NpbmcgcHJvZHVjdC5cIlxuICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlICsgRXJyb3JDb2RlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2MzpcbiAgICAgICAgICAgICAgICAvLyBBIHB1cmNoYXNlIChTSFB1cmNoYXNlKSBpcyByZXF1aXJlZCBiZWZvcmUgc2F2aW5nIGFuIFNIUHVyY2hhc2VFbnRyeSBvYmplY3RcbiAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZSA9IFwiUHVyY2hhc2VFbnRyeSBpcyBtaXNzaW5nIHB1cmNoYXNlLlwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2UgKyBFcnJvckNvZGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY0OlxuICAgICAgICAgICAgICAgIC8vIEEgZGVsaXZlcnlBZGRlcnNzIChTSEFkZHJlc3MpIGlzIHJlcXVpcmVkIGJlZm9yZSBzYXZpbmcgYW4gU0hQdXJjaGFzZUVudHJ5IG9iamVjdFxuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gXCJTSFB1cmNoYXNlRW50cnkgaXMgbWlzc2luZyBkZWxpdmVyeSBhZGRyZXNzLlwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2UgKyBFcnJvckNvZGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY1OlxuICAgICAgICAgICAgICAgIC8vIE9uZSBvciBtb3JlIHByb2R1Y3QgaXMgb3V0IG9mIG9yZGVyXG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIlByb2R1Y3QgaXMgb3V0IG9mIG9yZGVyLlwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2UgKyBFcnJvckNvZGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDcwOlxuICAgICAgICAgICAgICAgIC8vIFNob3AgY2FuIG9ubHkgYmUgbW9kaWZpZWQgYnkgaXRzIG93bmVyXG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIlNob3AgY2FuIG9ubHkgYmUgbW9kaWZpZWQgYnkgaXRzIG93bmVyLlwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2UgKyBFcnJvckNvZGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDcxOlxuICAgICAgICAgICAgICAgIC8vY29udGVudCAoU0hQYWdlKSBpcyByZXF1aXJlZCBiZWZvcmUgc2F2aW5nIGFuIFNIUGFnZSBvYmplY3RcbiAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZSA9IFwiU0hQYWdlIGlzIG1pc3NpbmcgY29udGVudC5cIlxuICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlICsgRXJyb3JDb2RlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA3MjpcbiAgICAgICAgICAgICAgICAvL2Rlc2NyaXB0aW9uIChTSFBhZ2UpIGlzIHJlcXVpcmVkIGJlZm9yZSBzYXZpbmcgYW4gU0hQYWdlIG9iamVjdFxuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gXCJTSFBhZ2UgaXMgbWlzc2luZyBkZXNjcmlwdGlvbi5cIlxuICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlICsgRXJyb3JDb2RlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA3MzpcbiAgICAgICAgICAgICAgICAvL2tleXdvcmQgKFNIUGFnZSkgaXMgcmVxdWlyZWQgYmVmb3JlIHNhdmluZyBhbiBTSFBhZ2Ugb2JqZWN0XG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIlNIUGFnZSBpcyBtaXNzaW5nIGtleXdvcmQuXCJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZSArIEVycm9yQ29kZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNzQ6XG4gICAgICAgICAgICAgICAgLy90aXRsZSAoU0hQYWdlKSBpcyByZXF1aXJlZCBiZWZvcmUgc2F2aW5nIGFuIFNIUGFnZSBvYmplY3RcbiAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZSA9IFwiU0hQYWdlIGlzIG1pc3NpbmcgdGl0bGUuXCJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZSArIEVycm9yQ29kZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy8gRXJyb3IgY29kZSBub3QgZm91bmRcbiAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZSA9IFwiRXJyb3IgY291bmQgbm90IGZvdW5kLlwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2UgKyBFcnJvckNvZGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENsYXNzIGZvciBhbGwgTWVtYmVyc2hpcCBvYmplY3QgdXNlZCBpbiBTaGVsZiBzeXN0ZW1cbiAqIEBjbGFzcyBTSC5NZW1iZXJzaGlwXG4gKiBAbWVtYmVyb2YhIDxnbG9iYWw+XG4gKiBAYXV0aG9yIFh1amllIFNvbmdcbiAqIEBjb3B5cmlnaHQgU0s4IFBUWSBMVEQgMjAxNVxuICogQGV4dGVuZHMge0FWLk9iamVjdH1cbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vbGVhbmNsb3VkLmNuL2RvY3MvanNfZ3VpZGUuaHRtbCPlr7nosaEgQVYuT2JqZWN0fVxuICogQHByb3BlcnR5IHtJbnR9IHJld2FyZFBvaW50IFJld2FyZFBvaW50IG9mIHRoaXMgTWVtYmVyc2hpcFxuICogQHByb3BlcnR5IHtTSC5TaG9wfSBzaG9wIFNob3Agb2YgdGhpcyBNZW1iZXJzaGlwXG4gKiBAcHJvcGVydHkge1NILlVzZXJ9IG1lbWJlciBUaGUgb3duZXIgb2YgdGhpcyBNZW1iZXJzaGlwXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oU0gsIEFWKSB7XG4gICAgLyoqXG4gICAgICogUmVjb21tZW5kZWQgd2F5IHRvXG4gICAgICogSW5pdGlhbGl6ZSBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgQ2xhc3NcbiAgICAgKiBAZnVuYyBTSC5NZW1iZXJzaGlwLnByb3RvdHlwZS5uZXdcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW2RhdGFdIEFuIGpzb24gb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIGRhdGFcbiAgICAgKiBAZXhhbXBsZSB2YXIgbWVtYmVyc2hpcCA9IFNILk1lbWJlcnNoaXAubmV3KHtcImlkXCI6IFwiYWJjZFwiKTtcbiAgICAgKi9cbiAgICBTSC5NZW1iZXJzaGlwID0gQVYuT2JqZWN0LmV4dGVuZChcIk1lbWJlcnNoaXBcIiwge1xuICAgICAgICAvL0luc3RhbmNlIHZhcmlhYmxlc1xuICAgICAgICAvL0luc3RhbmNlIGZ1bmN0aW9uc1xuICAgIH0sIHtcbiAgICAgICAgLy9TdGF0aWMgdmFyaWFibGVzXG4gICAgICAgIC8vU3RhdGljIGZ1bmN0aW9uc1xuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5NZW1iZXJzaGlwLnByb3RvdHlwZSwgXCJyZXdhcmRQb2ludFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJyZXdhcmRQb2ludFwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJyZXdhcmRQb2ludFwiLCBwYXJzZUludCh2YWx1ZSkpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILk1lbWJlcnNoaXAucHJvdG90eXBlLCBcInNob3BcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwic2hvcFwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJzaG9wXCIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5NZW1iZXJzaGlwLnByb3RvdHlwZSwgXCJ1c2VyXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldChcInVzZXJcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwidXNlclwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICAvKipcbiAgICAgKiBTZW5kIHRoZSBjb21tZW50IHRvIGEgcHJvZHVjdFxuICAgICAqIEBmdW5jIFNILk1lbWJlcnNoaXAucHJvdG90eXBlLnNlbmRcbiAgICAgKiBAcGFyYW0ge0ludH0gcG9pbnRzIE51bWJlciBvZiBwb2ludHMgdG8gYWNjdW11bGF0ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbY2FsbGJhY2tdIEFuIG9iamVjdCB0aGF0IGhhcyBhbiBvcHRpb25hbCBzdWNjZXNzIGZ1bmN0aW9uLCB0aGF0IHRha2VzIG5vIGFyZ3VtZW50cyBhbmQgd2lsbCBiZSBjYWxsZWQgb24gYSBzdWNjZXNzZnVsIHB1c2gsIGFuZCBhbiBlcnJvciBmdW5jdGlvbiB0aGF0IHRha2VzIGEgQVYuRXJyb3IgYW5kIHdpbGwgYmUgY2FsbGVkIGlmIHRoZSBwdXNoIGZhaWxlZC5cbiAgICAgKiBAZXhhbXBsZSBtZW1iZXJzaGlwLmFjY3VtdWxhdGVSZXdhcmQocG9pbnRzLCB7XG4gICAgICogICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24obWVtYmVyc2hpcCkge1xuICAgICAqICAgICAgICAgICAgICAvL01lbWJlcnNoaXAgYWNjdW11bGF0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICogICAgICAgICAgfSxcbiAgICAgKiAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgKiAgICAgICAgICAgICAgLy9TSC5zaG93RXJyb3IoZXJyb3IpO1xuICAgICAqICAgICAgICAgIH1cbiAgICAgKiAgICAgIH0pO1xuICAgICAqL1xuICAgIFNILk1lbWJlcnNoaXAucHJvdG90eXBlLmFjY3VtdWxhdGVSZXdhcmQgPSBmdW5jdGlvbihwb2ludHMsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuaW5jcmVtZW50KFwicmV3YXJkUG9pbnRcIiwgcG9pbnRzKTtcbiAgICAgICAgdGhpcy5zYXZlKGNhbGxiYWNrKTtcbiAgICB9XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENsYXNzIGZvciBhbGwgUGFnZSBvYmplY3QgdXNlZCBpbiBTaGVsZiBzeXN0ZW1cbiAqIEBjbGFzcyBTSC5QYWdlXG4gKiBAbWVtYmVyb2YhIDxnbG9iYWw+XG4gKiBAYXV0aG9yIFRpYW55aSBMaVxuICogQGNvcHlyaWdodCBTSzggUFRZIExURCAyMDE1XG4gKiBAZXh0ZW5kcyB7QVYuT2JqZWN0fVxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9sZWFuY2xvdWQuY24vZG9jcy9qc19ndWlkZS5odG1sI+WvueixoSBBVi5PYmplY3R9XG4gKiBAcHJvcGVydHkge1N0cmluZ30gY29udGVudCBDb250ZW50IG9mIHRoaXMgUGFnZVxuICogQHByb3BlcnR5IHtTdHJpbmd9IGRlc2NyaXB0aW9uIERlc2NyaXB0aW9uIG9mIHRoaXMgUGFnZVxuICogQHByb3BlcnR5IHtTdHJpbmd9IGtleXdvcmQgS2V5d29yZCBvZiB0aGlzIFBhZ2VcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSB0aXRsZSBUaXRsZSBvZiB0aGlzIFBhZ2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihTSCwgQVYpIHtcbiAgICAvKipcbiAgICAgKiBSZWNvbW1lbmRlZCB3YXkgdG9cbiAgICAgKiBJbml0aWFsaXplIGEgbmV3IGluc3RhbmNlIG9mIHRoZSBDbGFzc1xuICAgICAqIEBmdW5jIFNILlBhZ2UucHJvdG90eXBlLm5ld1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbZGF0YV0gQW4ganNvbiBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgZGF0YVxuICAgICAqIEBleGFtcGxlIHZhciBwYWdlID0gU0guUGFnZS5uZXcoe1wiaWRcIjogXCJhYmNkXCIpO1xuICAgICAqL1xuICAgIFNILlBhZ2UgPSBBVi5PYmplY3QuZXh0ZW5kKFwiUGFnZVwiLCB7XG4gICAgICAgIC8vSW5zdGFuY2UgdmFyaWFibGVzXG4gICAgICAgIC8vSW5zdGFuY2UgZnVuY3Rpb25zXG4gICAgfSwge1xuICAgICAgICAvL1N0YXRpYyB2YXJpYWJsZXNcbiAgICAgICAgLy9TdGF0aWMgZnVuY3Rpb25zXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILlBhZ2UucHJvdG90eXBlLCBcImNvbnRlbnRcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwiY29udGVudFwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJjb250ZW50XCIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5QYWdlLnByb3RvdHlwZSwgXCJkZXNjcmlwdGlvblwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJkZXNjcmlwdGlvblwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJkZXNjcmlwdGlvblwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guUGFnZS5wcm90b3R5cGUsIFwia2V5d29yZFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJrZXl3b3JkXCIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldChcImtleXdvcmRcIiwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILlBhZ2UucHJvdG90eXBlLCBcInRpdGxlXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldChcInRpdGxlXCIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldChcInRpdGxlXCIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xufSIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDbGFzcyBmb3IgYWxsIFByb2R1Y3Qgb2JqZWN0IHVzZWQgaW4gU2hlbGYgc3lzdGVtXG4gKiBAY2xhc3MgU0guUHJvZHVjdFxuICogQG1lbWJlcm9mISA8Z2xvYmFsPlxuICogQGF1dGhvciBYdWppZSBTb25nXG4gKiBAY29weXJpZ2h0IFNLOCBQVFkgTFREIDIwMTVcbiAqIEBleHRlbmRzIHtBVi5PYmplY3R9XG4gKiBAc2VlIHtAbGluayBodHRwczovL2xlYW5jbG91ZC5jbi9kb2NzL2pzX2d1aWRlLmh0bWwj5a+56LGhIEFWLk9iamVjdH1cbiAqIEBwcm9wZXJ0eSB7U0guQ2F0ZWdvcnl9IGNhdGVnb3J5IENhdGVnb3J5IG9mIHRoaXMgUHJvZHVjdFxuICogQHByb3BlcnR5IHtJbnR9IGNvbmRpdGlvbiBDb25kaXRpb24gb2YgdGhpcyBQcm9kdWN0XG4gKiBAcHJvcGVydHkge1N0cmluZ30gY3VycmVuY3kgQ3VycmVuY3kgb2YgdGhpcyBQcm9kdWN0XG4gKiBAcHJvcGVydHkge0FWLkZpbGV9IGNvdmVySW1hZ2UgQ292ZXJJbWFnZSBvZiB0aGlzIFByb2R1Y3RcbiAqIEBwcm9wZXJ0eSB7SW50fSBkZWxpdmVyeVByaWNlSW5DZW50IERlbGl2ZXJ5UHJpY2VJbkNlbnQgb2YgdGhpcyBQcm9kdWN0XG4gKiBAcHJvcGVydHkge0FycmF5fSBpbWFnZUFycmF5IEltYWdlQXJyYXkgb2YgdGhpcyBQcm9kdWN0XG4gKiBAcHJvcGVydHkge1N0cmluZ30gbmFtZSBOYW1lIG9mIHRoaXMgUHJvZHVjdFxuICogQHByb3BlcnR5IHtJbnR9IHByaWNlSW5DZW50IFByaWNlSW5DZW50IG9mIHRoaXMgUHJvZHVjdFxuICogQHByb3BlcnR5IHtJbnR9IHByb21vUHJpY2VJbkNlbnQgUHJvbW9QcmljZUluQ2VudCBvZiB0aGlzIFByb2R1Y3RcbiAqIEBwcm9wZXJ0eSB7SW50fSBxdWFudGl0eSBRdWFudGl0eSBvZiB0aGlzIFByb2R1Y3RcbiAqIEBwcm9wZXJ0eSB7U0guVXNlcn0gc2VsbGVyIFNlbGxlciBvZiB0aGlzIFByb2R1Y3RcbiAqIEBwcm9wZXJ0eSB7U0guU2hvcH0gc2hvcCBTaG9wIG9mIHRoaXMgUHJvZHVjdFxuICogQHByb3BlcnR5IHtTSC5Qcm9kdWN0LlNUQVRVU19YfSBzdGF0dXMgU3RhdHVzIG9mIHRoaXMgUHJvZHVjdFxuICogQHByb3BlcnR5IHtTdHJpbmd9IHN1bW1hcnkgU3VtbWFyeSBvZiB0aGlzIFByb2R1Y3RcbiAqIEBwcm9wZXJ0eSB7RmxvYXR9IGRlbGl2ZXJ5UHJpY2UgRGVsaXZlcnlQcmljZSBvZiB0aGlzIFByb2R1Y3RcbiAqIEBwcm9wZXJ0eSB7RmxvYXR9IHByaWNlIFByaWNlIG9mIHRoaXMgUHJvZHVjdFxuICogQHByb3BlcnR5IHtGbG9hdH0gcHJvbW9QcmljZSBQcm9tb1ByaWNlIG9mIHRoaXMgUHJvZHVjdFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKFNILCBBVikge1xuICAgIC8qKlxuICAgICAqIFJlY29tbWVuZGVkIHdheSB0b1xuICAgICAqIEluaXRpYWxpemUgYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIENsYXNzXG4gICAgICogQGZ1bmMgU0guUHJvZHVjdC5wcm90b3R5cGUubmV3XG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtkYXRhXSBBbiBqc29uIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSBkYXRhXG4gICAgICogQGV4YW1wbGUgdmFyIHByb2R1Y3QgPSBTSC5Qcm9kdWN0Lm5ldyh7XCJpZFwiOiBcImFiY2RcIik7XG4gICAgICovXG4gICAgU0guUHJvZHVjdCA9IEFWLk9iamVjdC5leHRlbmQoXCJQcm9kdWN0XCIsIHtcbiAgICAgICAgLy9JbnN0YW5jZSB2YXJpYWJsZXNcbiAgICAgICAgLy9JbnN0YW5jZSBmdW5jdGlvbnNcbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oYXR0ciwgb3B0aW9ucykge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJpbWFnZUFycmF5XCIsIFtdKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAgLy9TdGF0aWMgdmFyaWFibGVzXG4gICAgICAgIC8vU3RhdGljIGZ1bmN0aW9uc1xuICAgIH0pO1xuICAgIC8qKlxuICAgICAqIEBuYW1lIFNILlByb2R1Y3QuU1RBVFVTX1hcbiAgICAgKiBAZGVzY3JpcHRpb24gU0guUHJvZHVjdC5TVEFUVVNfWCBpcyB0aGUgYXZhaWxhYmxlIHN0YXR1cyBjb2RlIGRlc2NyaWJpbmcgdGhlIHN0YXR1cyBvZiB0aGUgcHJvZHVjdC5cbiAgICAgKiBAcHJvcGVydHkge2ludH0gU1RBVFVTX0xJU1RJTkcgU3RhdHVzIGNvZGUgaW5kaWNhdGluZyBwcm9kdWN0IGlzIHN0aWxsIGluLXN0b2NrIGFuZCBsaXN0aW5nLlxuICAgICAqIEBwcm9wZXJ0eSB7aW50fSBTVEFUVVNfUFJFT1JERVIgU3RhdHVzIGNvZGUgaW5kaWNhdGluZyBwcm9kdWN0IGlzIG9uIHByZS1vcmRlci5cbiAgICAgKiBAcHJvcGVydHkge2ludH0gU1RBVFVTX1NPTERPVVQgU3RhdHVzIGNvZGUgaW5kaWNhdGluZyBwcm9kdWN0IGlzIHNvbGQgb3V0LlxuICAgICAqIEBwcm9wZXJ0eSB7aW50fSBTVEFUVVNfUkVQT1JURUQgU3RhdHVzIGNvZGUgaW5kaWNhdGluZyBwcm9kdWN0IGlzIHJlcG9ydGVkIGJ5IHVzZXIuXG4gICAgICogQHByb3BlcnR5IHtpbnR9IFNUQVRVU19ERUxJU1RFRCBTdGF0dXMgY29kZSBpbmRpY2F0aW5nIHByb2R1Y3QgaXMgcmVtb3ZlZCBmcm9tIGxpc3RpbmcuXG4gICAgICogQHByb3BlcnR5IHtpbnR9IFNUQVRVU19ERUxFVEVEIFN0YXR1cyBjb2RlIGluZGljYXRpbmcgcHJvZHVjdCBpcyBkZWxldGVkLlxuICAgICAqL1xuICAgIFNILlByb2R1Y3QuU1RBVFVTX0xJU1RJTkcgPSAwO1xuICAgIFNILlByb2R1Y3QuU1RBVFVTX1BSRU9SREVSID0gMTAwO1xuICAgIFNILlByb2R1Y3QuU1RBVFVTX1NPTERPVVQgPSAyMDA7XG4gICAgU0guUHJvZHVjdC5TVEFUVVNfUkVQT1JURUQgPSA3MDA7XG4gICAgU0guUHJvZHVjdC5TVEFUVVNfREVMSVNURUQgPSA4MDA7XG4gICAgU0guUHJvZHVjdC5TVEFUVVNfREVMRVRFRCA9IDkwMDtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guUHJvZHVjdC5wcm90b3R5cGUsIFwiY2F0ZWdvcnlcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwiY2F0ZWdvcnlcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwiY2F0ZWdvcnlcIiwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILlByb2R1Y3QucHJvdG90eXBlLCBcImNvbmRpdGlvblwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5nZXQoXCJjb25kaXRpb25cIikgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldChcImNvbmRpdGlvblwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoXCJjb25kaXRpb25cIiwgMTApO1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldChcImNvbmRpdGlvblwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guUHJvZHVjdC5wcm90b3R5cGUsIFwiY3VycmVuY3lcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwiY3VycmVuY3lcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwiY3VycmVuY3lcIiwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILlByb2R1Y3QucHJvdG90eXBlLCBcImNvdmVySW1hZ2VcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwiY292ZXJJbWFnZVwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJjb3ZlckltYWdlXCIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5Qcm9kdWN0LnByb3RvdHlwZSwgXCJkZWxpdmVyeVByaWNlSW5DZW50XCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmdldChcImRlbGl2ZXJ5UHJpY2VJbkNlbnRcIikgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodGhpcy5nZXQoXCJkZWxpdmVyeVByaWNlSW5DZW50XCIpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoXCJkZWxpdmVyeVByaWNlSW5DZW50XCIsIHBhcnNlSW50KDApKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJkZWxpdmVyeVByaWNlSW5DZW50XCIsIHBhcnNlSW50KHZhbHVlKSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guUHJvZHVjdC5wcm90b3R5cGUsIFwiaW1hZ2VBcnJheVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJpbWFnZUFycmF5XCIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldChcImltYWdlQXJyYXlcIiwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILlByb2R1Y3QucHJvdG90eXBlLCBcIm5hbWVcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwibmFtZVwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJuYW1lXCIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5Qcm9kdWN0LnByb3RvdHlwZSwgXCJwcmljZUluQ2VudFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5nZXQoXCJwcmljZUluQ2VudFwiKSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCh0aGlzLmdldChcInByaWNlSW5DZW50XCIpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoXCJwcmljZUluQ2VudFwiLCBwYXJzZUludCgwKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwicHJpY2VJbkNlbnRcIiwgcGFyc2VJbnQodmFsdWUpKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5Qcm9kdWN0LnByb3RvdHlwZSwgXCJwcm9tb1ByaWNlSW5DZW50XCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmdldChcInByb21vUHJpY2VJbkNlbnRcIikgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodGhpcy5nZXQoXCJwcm9tb1ByaWNlSW5DZW50XCIpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoXCJwcm9tb1ByaWNlSW5DZW50XCIsIHBhcnNlSW50KDApKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJwcm9tb1ByaWNlSW5DZW50XCIsIHBhcnNlSW50KHZhbHVlKSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guUHJvZHVjdC5wcm90b3R5cGUsIFwicXVhbnRpdHlcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHF1YW50aXR5ID0gdGhpcy5nZXQoXCJxdWFudGl0eVwiKTtcbiAgICAgICAgICAgIGlmIChxdWFudGl0eSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAocXVhbnRpdHkgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHF1YW50aXR5ID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHF1YW50aXR5O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldChcInF1YW50aXR5XCIsIHBhckludCgwKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwicXVhbnRpdHlcIiwgcGFyc2VJbnQodmFsdWUpKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5Qcm9kdWN0LnByb3RvdHlwZSwgXCJzZWxsZXJcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwic2VsbGVyXCIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldChcInNlbGxlclwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guUHJvZHVjdC5wcm90b3R5cGUsIFwic2hvcFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJzaG9wXCIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKHNob3ApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwic2hvcFwiLCBzaG9wKTtcbiAgICAgICAgICAgIGlmIChzaG9wLm93bmVyICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsbGVyID0gc2hvcC5vd25lcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzaG9wLmN1cnJlbmN5ICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVuY3kgPSBzaG9wLmN1cnJlbmN5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILlByb2R1Y3QucHJvdG90eXBlLCBcInN0YXR1c1wiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJzdGF0dXNcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwic3RhdHVzXCIsIHBhcnNlSW50KHZhbHVlKSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guUHJvZHVjdC5wcm90b3R5cGUsIFwic3VtbWFyeVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJzdW1tYXJ5XCIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldChcInN1bW1hcnlcIiwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILlByb2R1Y3QucHJvdG90eXBlLCBcImRlbGl2ZXJ5UHJpY2VcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMudGVtcERlbGl2ZXJ5UHJpY2VTdHJpbmcgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50ZW1wRGVsaXZlcnlQcmljZVN0cmluZyA9IHBhcnNlRmxvYXQoKHRoaXMuZGVsaXZlcnlQcmljZUluQ2VudCAvIDEwMCkudG9GaXhlZCgyKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy50ZW1wRGVsaXZlcnlQcmljZVN0cmluZztcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5kZWxpdmVyeVByaWNlSW5DZW50ID0gcGFyc2VJbnQodmFsdWUgKiAxMDApO1xuICAgICAgICAgICAgLy90ZW1wU3RyaW5nIGlzIGhlcmUgdG8gZW5hYmxlIGRlY2ltYWwgaW5wdXQgZm9yIG5nLW1vZGVsXG4gICAgICAgICAgICB0aGlzLnRlbXBEZWxpdmVyeVByaWNlU3RyaW5nID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guUHJvZHVjdC5wcm90b3R5cGUsIFwicHJpY2VcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMudGVtcFByaWNlU3RyaW5nID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMudGVtcFByaWNlU3RyaW5nID0gcGFyc2VGbG9hdCgodGhpcy5wcmljZUluQ2VudCAvIDEwMCkudG9GaXhlZCgyKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy50ZW1wUHJpY2VTdHJpbmc7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMucHJpY2VJbkNlbnQgPSBwYXJzZUludCh2YWx1ZSAqIDEwMCk7XG4gICAgICAgICAgICAvL3RlbXBTdHJpbmcgaXMgaGVyZSB0byBlbmFibGUgZGVjaW1hbCBpbnB1dCBmb3IgbmctbW9kZWxcbiAgICAgICAgICAgIHRoaXMudGVtcFByaWNlU3RyaW5nID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guUHJvZHVjdC5wcm90b3R5cGUsIFwicHJvbW9QcmljZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodGhpcy50ZW1wUHJvbW9QcmljZVN0cmluZyA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRlbXBQcm9tb1ByaWNlU3RyaW5nID0gcGFyc2VGbG9hdCgodGhpcy5wcm9tb1ByaWNlSW5DZW50IC8gMTAwKS50b0ZpeGVkKDIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRlbXBQcm9tb1ByaWNlU3RyaW5nO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmljZSA8IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmljZSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wcm9tb1ByaWNlSW5DZW50ID0gcGFyc2VJbnQodmFsdWUgKiAxMDApO1xuICAgICAgICAgICAgLy90ZW1wU3RyaW5nIGlzIGhlcmUgdG8gZW5hYmxlIGRlY2ltYWwgaW5wdXQgZm9yIG5nLW1vZGVsXG4gICAgICAgICAgICB0aGlzLnRlbXBQcm9tb1ByaWNlU3RyaW5nID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHF1ZXJ5IGZvciBjb21tZW50cyByZWxhdGVkIHRvIHRoZSBwcm9kdWN0XG4gICAgICogQGZ1bmMgU0guUHJvZHVjdC5wcm90b3R5cGUuZ2V0Q29tbWVudHNRdWVyeVxuICAgICAqIEBleGFtcGxlIHZhciBjb21tZW50UXVlcnkgPSBwcm9kdWN0LmdldENvbW1lbnRzUXVlcnkoKTtcbiAgICAgKi9cbiAgICBTSC5Qcm9kdWN0LnByb3RvdHlwZS5nZXRDb21tZW50c1F1ZXJ5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgcXVlcnkgPSBuZXcgQVYuUXVlcnkoU0guQ29tbWVudCk7XG4gICAgICAgICAgICBxdWVyeS5hc2NlbmRpbmcoXCJjcmVhdGVkQXRcIik7XG4gICAgICAgICAgICBxdWVyeS5lcXVhbFRvKFwicHJvZHVjdFwiLCB0aGlzKTtcbiAgICAgICAgICAgIHJldHVybiBxdWVyeTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IHRoZSBxdWVyeSBmb3IgY29tbWVudHMgcmVsYXRlZCB0byB0aGUgcHJvZHVjdFxuICAgICAgICAgKiBAZnVuYyBTSC5Qcm9kdWN0LnByb3RvdHlwZS5nZXRMaWtlZFVzZXJRdWVyeVxuICAgICAgICAgKiBAZXhhbXBsZSB2YXIgdXNlclF1ZXJ5ID0gcHJvZHVjdC5nZXRMaWtlZFVzZXJRdWVyeSgpO1xuICAgICAgICAgKi9cbiAgICBTSC5Qcm9kdWN0LnByb3RvdHlwZS5nZXRMaWtlZFVzZXJRdWVyeSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcXVlcnkgPSBBVi5SZWxhdGlvbi5yZXZlcnNlUXVlcnkoJ19Vc2VyJywgJ3Byb2R1Y3RMaWtlZCcsIHRoaXMpO1xuICAgICAgICByZXR1cm4gcXVlcnk7XG4gICAgfVxufSIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDbGFzcyBmb3IgYWxsIFB1cmNoYXNlIG9iamVjdCB1c2VkIGluIFNoZWxmIHN5c3RlbVxuICogQGNsYXNzIFNILlB1cmNoYXNlXG4gKiBAbWVtYmVyb2YhIDxnbG9iYWw+XG4gKiBAYXV0aG9yIFh1amllIFNvbmdcbiAqIEBjb3B5cmlnaHQgKGMpIFNLOCBQVFkgTFREIDIwMTUuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBAZXh0ZW5kcyB7QVYuT2JqZWN0fVxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9sZWFuY2xvdWQuY24vZG9jcy9qc19ndWlkZS5odG1sI+WvueixoSBBVi5PYmplY3R9XG4gKiBAcHJvcGVydHkge1NILlVzZXJ9IGJ1eWVyIFRoZSBidXllciBvZiB0aGlzIFB1cmNoYXNlXG4gKiBAcHJvcGVydHkge1N0cmluZ30gY29tbWVudCBUaGUgY29tbWVudCBidXllciBsZWZ0IGZvciBzZWxsZXJcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBjdXJyZW5jeSBUaGUgY3VycmVuY3kgdXNlZCBvZiB0aGlzIFB1cmNoYXNlXG4gKiBAcHJvcGVydHkge1NILkFkZHJlc3N9IGRlbGl2ZXJ5QWRkcmVzcyBUaGUgZGVsaXZlcnlBZGRyZXNzIG9mIHRoaXMgUHVyY2hhc2VcbiAqIEBwcm9wZXJ0eSB7SW50fSBkZWxpdmVyeVByaWNlSW5DZW50IFRoZSBkZWxpdmVyeSBwcmljZSBvZiB0aGlzIFB1cmNoYXNlLCBpbiBjZW50XG4gKiBAcHJvcGVydHkge0ludH0gcHJpY2VJbkNlbnQgVGhlIHN1YnRvdGFsIHByaWNlIG9mIHRoaXMgUHVyY2hhc2VcbiAqIEBwcm9wZXJ0eSB7U0guUHVyY2hhc2UuU1RBVFVTX1h9IHN0YXR1cyBTdGF0dXMgb2YgdGhpcyBQdXJjaGFzZVxuICogQHByb3BlcnR5IHtTdHJpbmd9IHN1bW1hcnkgVGhlIHN1bW1hcnkgb2YgdGhpcyBQdXJjaGFzZVxuICogQHByb3BlcnR5IHtTdHJpbmd9IHRyYW5zYWN0aW9uSWQgVGhlIGNoYXJnZUlkIG9mIHRoZSBjaGFyZ2Ugb2JqZWN0IHVzZWQgaW4gU3RyaXBlXG4gKiBAc2VlIHtAbGluayBodHRwczovL3N0cmlwZS5jb20vZG9jcy9hcGkvbm9kZSNjaGFyZ2VzIH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihTSCwgQVYpIHtcblx0LyoqXG5cdCAqIFJlY29tbWVuZGVkIHdheSB0b1xuXHQgKiBJbml0aWFsaXplIGEgbmV3IGluc3RhbmNlIG9mIHRoZSBDbGFzc1xuXHQgKiBAZnVuYyBTSC5QdXJjaGFzZS5wcm90b3R5cGUubmV3XG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBbZGF0YV0gQW4ganNvbiBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgZGF0YVxuXHQgKiBAZXhhbXBsZSB2YXIgcHVyY2hhc2UgPSBTSC5QdXJjaGFzZS5uZXcoKTtcblx0ICovXG5cdFNILlB1cmNoYXNlID0gQVYuT2JqZWN0LmV4dGVuZChcIlB1cmNoYXNlXCIsIHtcblx0XHRpdGVtTGlzdDogW10sXG5cdFx0c3RhdHVzOiAwLFxuXHRcdHRvdGFsUHJpY2VJbkNlbnQ6IDBcblxuXG5cdH0sIHtcblx0XHQvL1N0YXRpYyB2YXJpYWJsZXNcblx0XHQvL1N0YXRpYyBmdW5jdGlvbnNcblx0fSk7XG5cblxuXHQvKipcblx0ICogQWRkIGEgcHJvZHVjdCB0aGUgdGhlIHB1cmNoYXNlXG5cdCAqIEBmdW5jIFNILlB1cmNoYXNlLnByb3RvdHlwZS5hZGRQcm9kdWN0XG5cdCAqIEBwYXJhbSB7U0guVXNlcn0gYnV5ZXIgVGhlIGJ1eWVyIG9mIHRoZSBwdXJjaGFzZVxuXHQgKiBAcGFyYW0ge1NILlByb2R1Y3R9IHByb2R1Y3QgVGhlIHByb2R1Y3QgdG8gYWRkIHRvIHB1cmNoYXNlXG5cdCAqIEBwYXJhbSB7SW50fSBxdWFudGl0eSBUaGUgcXVhbnRpdHkgYWRkaW5nIHRvIGNhcnRcblx0ICogQGV4YW1wbGUgXG5cdCAqICAgXHRwdXJjaGFzZS5hZGRQcm9kdWN0KHByb2R1Y3QpO1xuXHQgKi9cblx0U0guUHVyY2hhc2UucHJvdG90eXBlLmFkZFByb2R1Y3QgPSBmdW5jdGlvbiAoYnV5ZXIsIHByb2R1Y3QsIHF1YW50aXR5KSB7XG5cdFx0aWYgKHRoaXMuc3RhdHVzID09IFNILlB1cmNoYXNlLlNUQVRVU19JTklUSUFURUQpIHtcblx0XHRcdHZhciBwdXJjaGFzZUVudHJ5ID0gU0guUHVyY2hhc2VFbnRyeS5uZXcoKTtcblx0XHRcdHB1cmNoYXNlRW50cnkuYnV5ZXIgPSBidXllcjtcblx0XHRcdHB1cmNoYXNlRW50cnkucHJvZHVjdCA9IHByb2R1Y3Q7XG5cdFx0XHRwdXJjaGFzZUVudHJ5LnF1YW50aXR5ID0gcXVhbnRpdHk7XG5cdFx0XHRwdXJjaGFzZUVudHJ5LnNlbGxlciA9IHByb2R1Y3Quc2VsbGVyO1xuXHRcdFx0cHVyY2hhc2VFbnRyeS5wdXJjaGFzZSA9IHRoaXM7XG5cdFx0XHRwdXJjaGFzZUVudHJ5LmRlbGl2ZXJ5QWRkcmVzcyA9IGJ1eWVyLmFkZHJlc3M7XG5cdFx0XHQvL1NILmxvZyhcImFkZHJlc3MuaWQ6IFwiICsgYWRkcmVzcy5pZCk7XG5cdFx0XHR2YXIgcHJpY2VJbkNlbnQgPSBwcm9kdWN0LnByb21vUHJpY2U7XG5cdFx0XHRpZiAocHJpY2VJbkNlbnQgPT0gMCB8fCBwcmljZUluQ2VudCA9PSBudWxsKSB7XG5cdFx0XHRcdHByaWNlSW5DZW50ID0gcHJvZHVjdC5wcmljZSAqIHF1YW50aXR5O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cHJpY2VJbkNlbnQgPSBwcmljZUluQ2VudCAqIHF1YW50aXR5O1xuXHRcdFx0fVxuXHRcdFx0cHVyY2hhc2VFbnRyeS5wdXJjaGFzZVByaWNlSW5DZW50ID0gcHJpY2VJbkNlbnQ7XG5cdFx0XHR0aGlzLml0ZW1MaXN0LnB1c2gocHVyY2hhc2VFbnRyeSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdFNILmxvZyhcIlB1cmNoYXNlIGNhbiBvbmx5IGJlIG1vZGlmaWVkIGJlZm9yZSBwYXltZW50LlwiKTtcblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIFJlbW92ZSBhIHByb2R1Y3QgZnJvbSB0aGUgcHVyY2hhc2Vcblx0ICogQGZ1bmMgU0guUHVyY2hhc2UucHJvdG90eXBlLnJlbW92ZVByb2R1Y3Rcblx0ICogQHBhcmFtIHtTSC5Qcm9kdWN0fSBwcm9kdWN0IFRoZSBwcm9kdWN0IHRvIHJlbW92ZVxuXHQgKiBAZXhhbXBsZSBcblx0ICogXHRcdHB1cmNoYXNlLnJlbW92ZVByb2R1Y3QocHJvZHVjdCk7XG5cdCAqL1xuXHRTSC5QdXJjaGFzZS5wcm90b3R5cGUucmVtb3ZlUHJvZHVjdCA9IGZ1bmN0aW9uKHByb2R1Y3QpIHtcblx0XHRpZiAodGhpcy5zdGF0dXMgPT0gU0guUHVyY2hhc2UuU1RBVFVTX0lOSVRJQVRFRCkge1xuXHRcdFx0dmFyIHBvc2l0aW9uID0gTmFOO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLml0ZW1MaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmICh0aGlzLml0ZW1MaXN0W2ldLnByb2R1Y3QgPT09IHByb2R1Y3QpIHtcblx0XHRcdFx0XHRTSC5sb2coXCJyZW1vdmVQcm9kdWN0IGZvdW5kOiBcIiArIFwiW1wiICsgaSArIFwiXSBcIiArIHRoaXMuaXRlbUxpc3RbaV0ucHJvZHVjdC5uYW1lKTtcblx0XHRcdFx0XHRwb3NpdGlvbiA9IGk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChwb3NpdGlvbiAhPSBOYU4pIHtcblx0XHRcdFx0dGhpcy5pdGVtTGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0U0gubG9nKFwiUHJvZHVjdCBoYXMgbm90IGJlZW4gZm91bmQuXCIpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRTSC5sb2coXCJQdXJjaGFzZSBjYW4gb25seSBiZSBtb2RpZmllZCBiZWZvcmUgcGF5bWVudC5cIik7XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiBDbGVhciBhbGwgcHVyY2hhc2UgZW50cmllcyBpbiB0aGUgcHVyY2hhc2Vcblx0ICogQGZ1bmMgU0guUHVyY2hhc2UucHJvdG90eXBlLmNsZWFyXG5cdCAqIEBleGFtcGxlIHB1cmNoYXNlLmNsZWFyKCk7XG5cdCAqL1xuXHRTSC5QdXJjaGFzZS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLml0ZW1MaXN0ID0gW107XG5cdH07XG5cblx0LyoqXG5cdCAqIFZhbGlkYXRlIHRoZSBwdXJjaGFzZVxuXHQgKiBAZnVuYyBTSC5QdXJjaGFzZS5wcm90b3R5cGUudmFsaWRhdGVQdXJjaGFzZVxuXHQgKiBAcmV0dXJuIHtCb29sZWFufSBXaGVhdGhlciB0aGUgcHVyY2hhc2UgaXMgdmFsaWRcblx0ICovXG5cdFNILlB1cmNoYXNlLnByb3RvdHlwZS52YWxpZGF0ZVB1cmNoYXNlID0gZnVuY3Rpb24oKSB7XG5cdFx0Ly8gVGhlbiwgY2hlY2sgaWYgaXRlbSByZWxhdGlvbiBpcyBlbXB0eVxuXHRcdGlmICh0aGlzLml0ZW1MaXN0Lmxlbmd0aCA9PSAwKSB7XG5cdFx0XHRTSC5sb2coXCJbaXRlbUxpc3QubGVuZ3RoIGlzIDBdUGxlYXNlIGhhdmUgYXQgbGVhc3Qgb25lIHByb2R1Y3QgdG8gbWFrZSB0aGUgcHVyY2hhc2UuXCIpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHQvLyBDaGVjayB0b3RhbCBwcmljZVxuXHRcdGlmICh0aGlzLnJlZnJlc2hQcmljZUluQ2VudCgpID09IDApIHtcblx0XHRcdFNILmxvZyhcIltwcmljZUluQ2VudCBpcyAwXVBsZWFzZSBoYXZlIGF0IGxlYXN0IG9uZSBwcm9kdWN0IHRvIG1ha2UgdGhlIHB1cmNoYXNlLlwiKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0Ly8gSWYgZXZlcnl0aGluZyB3ZW50IG9rLCBjaGVja091dCB0aGUgcHVyY2hhc2Vcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fTtcblxuXHQvKipcblx0ICogR2V0IHRoZSBudW1iZXIgb2YgcHVyY2hhc2UgZW50cmllcy4gRS5nLiAzIEFwcGxlcyBhbmQgMiBQZWFycywgcmV0dXJucyAyIHByb2R1Y3RzLCBjb3VudGVkIGJ5ICdwdXJjaGFzZSBlbnRyaWVzJyBpdHNlbGYuXG5cdCAqIEBmdW5jIFNILlB1cmNoYXNlLnByb3RvdHlwZS5nZXRQdXJjaGFzZUVudHJ5QW1vdW50XG5cdCAqIEByZXR1cm4ge0ludH0gVGhlIG51bWJlciBvZiBwcm9kdWN0LiBcblx0ICovXG5cdFNILlB1cmNoYXNlLnByb3RvdHlwZS5nZXRQdXJjaGFzZUVudHJ5QW1vdW50ID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCF0aGlzLml0ZW1MaXN0KSB7XG5cdFx0XHRyZXR1cm4gMDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMuaXRlbUxpc3QubGVuZ3RoO1xuXHRcdH07XG5cdH07XG5cblx0LyoqXG5cdCAqIFJlZnJlc2ggdGhlIHByaWNlLCBpbiA8c3Ryb25nPkNFTlQ8L3N0cm9uZz4sIGZvciBhbGwgcHVyY2hhc2UgZW50cmllcyBpbiB0aGlzIHB1cmNoYXNlXG5cdCAqIEBmdW5jIFNILlB1cmNoYXNlLnByb3RvdHlwZS5yZWZyZXNoUHJpY2VJbkNlbnRcblx0ICogQHJldHVybiB7SW50fSBwcmljZUluQ2VudCBUaGUgcHJpY2UgaW4gY2VudCwgPHN0cm9uZz5leGNsdWRpbmc8L3N0cm9uZz4gZGVsaXZlcnkgcHJpY2Vcblx0ICovXG5cdFNILlB1cmNoYXNlLnByb3RvdHlwZS5yZWZyZXNoUHJpY2VJbkNlbnQgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgdG90YWxJbkNlbnQgPSAwO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pdGVtTGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdFx0Ly9TSC5sb2coXCJJbiBTREsgLS0gaXRlbUxpc3QgbGVuZ3RoOiBcIiArIHRoaXMuaXRlbUxpc3QubGVuZ3RoKVxuXHRcdFx0dmFyIHByb2R1Y3QgPSB0aGlzLml0ZW1MaXN0W2ldLnByb2R1Y3Q7XG5cdFx0XHR2YXIgcXVhbnRpdHkgPSB0aGlzLml0ZW1MaXN0W2ldLnF1YW50aXR5O1xuXHRcdFx0Ly9GaXJzdCBjaGVjayBpZiBpdGVtIGlzIG9uIHByb21vdGlvblxuXHRcdFx0dmFyIHByaWNlSW5DZW50ID0gcHJvZHVjdC5wcm9tb1ByaWNlSW5DZW50O1xuXHRcdFx0Ly9TSC5sb2coXCJJbiBTREsgLS0gcHJvbW9QcmljZUluQ2VudDogXCIgKyBwcmljZUluQ2VudCk7XG5cdFx0XHQvL1NILmxvZyhcIkluIFNESyAtLSBxdWFudGl0eTogXCIgKyBxdWFudGl0eSk7XG5cdFx0XHRpZiAocHJpY2VJbkNlbnQgPT0gMCB8fCAhcHJpY2VJbkNlbnQpIHtcblx0XHRcdFx0cHJpY2VJbkNlbnQgPSBwcm9kdWN0LnByaWNlSW5DZW50ICogcXVhbnRpdHk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRwcmljZUluQ2VudCA9IHByaWNlSW5DZW50ICogcXVhbnRpdHk7XG5cdFx0XHR9XG5cdFx0XHR0b3RhbEluQ2VudCArPSBwcmljZUluQ2VudDtcblx0XHR9XG5cdFx0dGhpcy5zZXQoXCJwcmljZUluQ2VudFwiLCB0b3RhbEluQ2VudCk7XG5cdFx0Ly9TSC5sb2coXCJJbiBTREsgLS0gcHJpY2VJbkNlbnQ6IFwiICsgdG90YWxJbkNlbnQpO1xuXHRcdHJldHVybiB0b3RhbEluQ2VudDtcblx0fTtcblxuXHQvKipcblx0ICogUmVmcmVzaCB0aGUgcHJpY2UsIGluIDxzdHJvbmc+RE9MTEFSPC9zdHJvbmc+LCBmb3IgYWxsIHB1cmNoYXNlIGVudHJpZXMgaW4gdGhpcyBwdXJjaGFzZVxuXHQgKiBAZnVuYyBTSC5QdXJjaGFzZS5wcm90b3R5cGUucmVmcmVzaFByaWNlXG5cdCAqIEByZXR1cm4ge0ludH0gcHJpY2UgVGhlIHByaWNlIGluIGRvbGxhciwgPHN0cm9uZz5leGNsdWRpbmc8L3N0cm9uZz4gZGVsaXZlcnkgcHJpY2UuXG5cdCAqL1xuXHRTSC5QdXJjaGFzZS5wcm90b3R5cGUucmVmcmVzaFByaWNlID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHRvdGFsID0gcGFyc2VJbnQodGhpcy5yZWZyZXNoUHJpY2VJbkNlbnQoKSk7XG5cdFx0dG90YWwgPSB0b3RhbCAvIDEwMFxuXHRcdHJldHVybiB0b3RhbFxuXHR9O1xuXG5cdC8qKlxuXHQgKiBSZWZyZXNoIHRoZSA8c3Ryb25nPmRlbGl2ZXJ5PC9zdHJvbmc+IHByaWNlLCBpbiA8c3Ryb25nPkNFTlQ8L3N0cm9uZz4sIGZvciBhbGwgcHVyY2hhc2UgZW50cmllcyBpbiB0aGlzIHB1cmNoYXNlXG5cdCAqIEBmdW5jIFNILlB1cmNoYXNlLnByb3RvdHlwZS5yZWZyZXNoRGVsaXZlcnlJbkNlbnRcblx0ICogQHJldHVybiB7SW50fSBkZWxpdmVyeVByaWNlSW5DZW50IFRoZSBkZWxpdmVyeSBwcmljZSBpbiBjZW50LlxuXHQgKi9cblx0U0guUHVyY2hhc2UucHJvdG90eXBlLnJlZnJlc2hEZWxpdmVyeUluQ2VudCA9IGZ1bmN0aW9uKCkge1xuXHRcdC8vRmluZCB0aGUgaGlnaGVzdCBkZWxpdmVyeSBmZWVcblx0XHR2YXIgZGVsaXZlcnlGZWUgPSAwO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pdGVtTGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIHByb2R1Y3QgPSB0aGlzLml0ZW1MaXN0W2ldLnByb2R1Y3Q7XG5cdFx0XHQvL0ZpbmQgdGhlIG1heGltdW0gZGVsaXZlcnkgZmVlXG5cdFx0XHR2YXIgZGVsaXZlcnlJbkNlbnQgPSBwcm9kdWN0LmRlbGl2ZXJ5UHJpY2U7XG5cdFx0XHRpZiAoZGVsaXZlcnlJbkNlbnQgPiBkZWxpdmVyeUZlZSkge1xuXHRcdFx0XHRkZWxpdmVyeUZlZSA9IGRlbGl2ZXJ5SW5DZW50O1xuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLnNldChcImRlbGl2ZXJ5UHJpY2VJbkNlbnRcIiwgZGVsaXZlcnlGZWUpO1xuXHRcdC8vU0gubG9nKFwiSW4gU0RLIC0tIERlbGlldmVyeUNlbnQ6IFwiICsgZGVsaXZlcnlGZWUpO1xuXHRcdHJldHVybiBkZWxpdmVyeUZlZTtcblx0fTtcblxuXHQvKipcblx0ICogUmVmcmVzaCB0aGUgPHN0cm9uZz5kZWxpdmVyeTwvc3Ryb25nPiBwcmljZSwgaW4gPHN0cm9uZz5ET0xMQVI8L3N0cm9uZz4sIGZvciBhbGwgcHVyY2hhc2UgZW50cmllcyBpbiB0aGlzIHB1cmNoYXNlXG5cdCAqIEBmdW5jIFNILlB1cmNoYXNlLnByb3RvdHlwZS5yZWZyZXNoRGVsaXZlcnlcblx0ICogQHJldHVybiB7SW50fSBkZWxpdmVyeVByaWNlSW5Eb2xsYXIgVGhlIGRlbGl2ZXJ5IHByaWNlIGluIGRvbGxhci5cblx0ICovXG5cdFNILlB1cmNoYXNlLnByb3RvdHlwZS5yZWZyZXNoRGVsaXZlcnkgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgdG90YWxEZWxpdmVyeSA9IChwYXJzZUludCh0aGlzLnJlZnJlc2hEZWxpdmVyeUluQ2VudCgpKSkgLyAxMDA7XG5cdFx0cmV0dXJuIHRvdGFsRGVsaXZlcnk7XG5cdH07XG5cdFxuXHQvKipcblx0ICogQG5hbWUgU0guUHVyY2hhc2UuU1RBVFVTX1hcblx0ICogQGRlc2NyaXB0aW9uIFNILlB1cmNoYXNlLlNUQVRVU19YIGlzIHRoZSBhdmFpbGFibGUgc3RhdHVzIGNvZGUgZGVzY3JpYmluZyB0aGUgc3RhdHVzIG9mIHRoZSBwdXJjaGFzZS5cblx0ICogQHByb3BlcnR5IHtpbnR9IFNUQVRVU19JTklUSUFURUQgU3RhdHVzIGNvZGUgaW5kaWNhdGluZyBwcm9kdWN0IGlzIHN0aWxsIGluLXN0b2NrIGFuZCBsaXN0aW5nLlxuXHQgKiBAcHJvcGVydHkge2ludH0gU1RBVFVTX1BBWU1FTlRfUkVDRUlWRUQgU3RhdHVzIGNvZGUgaW5kaWNhdGluZyBwcm9kdWN0IGlzIG9uIHByZS1vcmRlci5cblx0ICogQHByb3BlcnR5IHtpbnR9IFNUQVRVU19TVUNDRUVERUQgU3RhdHVzIGNvZGUgaW5kaWNhdGluZyBwcm9kdWN0IGlzIHNvbGQgb3V0LlxuXHQgKiBAcHJvcGVydHkge2ludH0gU1RBVFVTX0NBTkNFTExFRCBTdGF0dXMgY29kZSBpbmRpY2F0aW5nIHByb2R1Y3QgaXMgcmVwb3J0ZWQgYnkgdXNlci5cblx0ICogQHByb3BlcnR5IHtpbnR9IFNUQVRVU19ERUxFVEVEIFN0YXR1cyBjb2RlIGluZGljYXRpbmcgcHJvZHVjdCBpcyByZW1vdmVkIGZyb20gbGlzdGluZy5cblx0ICovXG5cdFNILlB1cmNoYXNlLlNUQVRVU19JTklUSUFURUQgPSAwO1xuXHRTSC5QdXJjaGFzZS5TVEFUVVNfUEFZTUVOVF9SRUNFSVZFRCA9IDEwMDtcblx0U0guUHVyY2hhc2UuU1RBVFVTX1NVQ0NFRURFRCA9IDcwMDtcblx0U0guUHVyY2hhc2UuU1RBVFVTX0NBTkNFTExFRCA9IDgwMDtcblx0U0guUHVyY2hhc2UuU1RBVFVTX0RFTEVURUQgPSA5MDA7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5QdXJjaGFzZS5wcm90b3R5cGUsIFwiYnV5ZXJcIiwge1xuXHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXQoXCJidXllclwiKTtcblx0XHR9LFxuXHRcdHNldDogZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdHRoaXMuc2V0KFwiYnV5ZXJcIiwgdmFsdWUpO1xuXHRcdH1cblx0fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5QdXJjaGFzZS5wcm90b3R5cGUsIFwiY29tbWVudFwiLCB7XG5cdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldChcImNvbW1lbnRcIik7XG5cdFx0fSxcblx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR0aGlzLnNldChcImNvbW1lbnRcIiwgdmFsdWUpO1xuXHRcdH1cblx0fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5QdXJjaGFzZS5wcm90b3R5cGUsIFwiY3VycmVuY3lcIiwge1xuXHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXQoXCJjdXJyZW5jeVwiKTtcblx0XHR9LFxuXHRcdHNldDogZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdHRoaXMuc2V0KFwiY3VycmVuY3lcIiwgdmFsdWUpO1xuXHRcdH1cblx0fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5QdXJjaGFzZS5wcm90b3R5cGUsIFwiZGVsaXZlcnlBZGRyZXNzXCIsIHtcblx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0KFwiZGVsaXZlcnlBZGRyZXNzXCIpO1xuXHRcdH0sXG5cdFx0c2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0dGhpcy5zZXQoXCJkZWxpdmVyeUFkZHJlc3NcIiwgdmFsdWUpO1xuXHRcdH1cblx0fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5QdXJjaGFzZS5wcm90b3R5cGUsIFwiZGVsaXZlcnlQcmljZUluQ2VudFwiLCB7XG5cdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldChcImRlbGl2ZXJ5UHJpY2VJbkNlbnRcIik7XG5cdFx0fSxcblx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR0aGlzLnNldChcImRlbGl2ZXJ5UHJpY2VJbkNlbnRcIiwgcGFyc2VJbnQodmFsdWUpKTtcblx0XHR9XG5cdH0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guUHVyY2hhc2UucHJvdG90eXBlLCBcInByaWNlSW5DZW50XCIsIHtcblx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0KFwicHJpY2VJbkNlbnRcIik7XG5cdFx0fSxcblx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR0aGlzLnNldChcInByaWNlSW5DZW50XCIsIHBhcnNlSW50KHZhbHVlKSk7XG5cdFx0fVxuXHR9KTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guUHVyY2hhc2UucHJvdG90eXBlLCBcInN0YXR1c1wiLCB7XG5cdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldChcInN0YXR1c1wiKTtcblx0XHR9LFxuXHRcdHNldDogZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdHRoaXMuc2V0KFwic3RhdHVzXCIsIHBhcnNlSW50KHZhbHVlKSk7XG5cdFx0fVxuXHR9KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KFNILlB1cmNoYXNlLnByb3RvdHlwZSwgXCJzdW1tYXJ5XCIsIHtcblx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0KFwic3VtbWFyeVwiKTtcblx0XHR9LFxuXHRcdHNldDogZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdHRoaXMuc2V0KFwic3VtbWFyeVwiLCB2YWx1ZSk7XG5cdFx0fVxuXHR9KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KFNILlB1cmNoYXNlLnByb3RvdHlwZSwgXCJ0b3RhbFByaWNlSW5DZW50XCIsIHtcblx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0KFwidG90YWxQcmljZUluQ2VudFwiKTtcblx0XHR9LFxuXHRcdHNldDogZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdHRoaXMuc2V0KFwidG90YWxQcmljZUluQ2VudFwiLCBwYXJzZUludCh2YWx1ZSkpO1xuXHRcdH1cblx0fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5QdXJjaGFzZS5wcm90b3R5cGUsIFwidHJhbnNhY3Rpb25JZFwiLCB7XG5cdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldChcInRyYW5zYWN0aW9uSWRcIik7XG5cdFx0fSxcblx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR0aGlzLnNldChcInRyYW5zYWN0aW9uSWRcIiwgdmFsdWUpO1xuXHRcdH1cblx0fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5QdXJjaGFzZS5wcm90b3R5cGUsIFwiZGVsaXZlcnlQcmljZVwiLCB7XG5cdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBwYXJzZUZsb2F0KCh0aGlzLmRlbGl2ZXJ5UHJpY2VJbkNlbnQgLyAxMDApLnRvRml4ZWQoMikpO1xuXHRcdH0sXG5cdFx0c2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0dGhpcy5zZXQoXCJkZWxpdmVyeVByaWNlSW5DZW50XCIsIHBhcnNlSW50KHZhbHVlICogMTAwKSk7XG5cdFx0fVxuXHR9KTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ2xhc3MgZm9yIGFsbCBQYWdlIG9iamVjdCB1c2VkIGluIFNoZWxmIHN5c3RlbVxuICogQGNsYXNzIFNILlB1cmNoYXNlRW50cnlcbiAqIEBtZW1iZXJvZiEgPGdsb2JhbD5cbiAqIEBhdXRob3IgWHVqaWUgU29uZ1xuICogQGNvcHlyaWdodCBTSzggUFRZIExURCAyMDE1XG4gKiBAZXh0ZW5kcyB7QVYuT2JqZWN0fVxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9sZWFuY2xvdWQuY24vZG9jcy9qc19ndWlkZS5odG1sI+WvueixoSBBVi5PYmplY3R9XG4gKiBAcHJvcGVydHkge1NILlVzZXJ9IGJ1eWVyIEJ1eWVyIG9mIHRoaXMgUHVyY2hhc2VFbnRyeVxuICogQHByb3BlcnR5IHtTdHJpbmd9IGN1cnJlbmN5IEN1cnJlbnQgdXNlZCBmb3IgdGhpcyBQdXJjaGFzZUVudHJ5XG4gKiBAcHJvcGVydHkge1NILkFkZHJlc3N9IGRlbGl2ZXJ5QWRkcmVzcyBUaGUgZGVsaXZlcnlBZGRyZXNzIG9mIHRoaXMgUHVyY2hhc2VFbnRyeVxuICogQHByb3BlcnR5IHtTSC5Qcm9kdWN0fSBwcm9kdWN0IFByb2R1Y3Qgb2YgdGhpcyBQdXJjaGFzZUVudHJ5XG4gKiBAcHJvcGVydHkge1NILlB1cmNoYXNlfSBwdXJjaGFzZSBQdXJjaGFzZSBvZiB0aGlzIFB1cmNoYXNlRW50cnlcbiAqIEBwcm9wZXJ0eSB7SW50fSBwdXJjaGFzZVByaWNlSW5DZW50IEhpc3RvcmljYWwgcHJpY2Ugb2YgdGhpcyBwcm9kdWN0IGF0IHB1cmNoYXNlXG4gKiBAcHJvcGVydHkge0ludH0gcXVhbnRpdHkgUXVhbnRpdHkgb2YgdGhpcyBQdXJjaGFzZUVudHJ5XG4gKiBAcHJvcGVydHkge0ludH0gcmF0aW5nIFJhdGluZyBvZiB0aGlzIFB1cmNoYXNlRW50cnlcbiAqIEBwcm9wZXJ0eSB7U0guVXNlcn0gc2VsbGVyIFNlbGxlciBvZiB0aGlzIFB1cmNoYXNlRW50cnlcbiAqIEBwcm9wZXJ0eSB7U0guU2hpcHBpbmd9IHNoaXBwaW5nIFRoZSBzaGlwcGluZyBpbmZvIG9mIHRoaXMgUHVyY2hhc2VFbnRyeVxuICogQHByb3BlcnR5IHtTSC5TaG9wfSBzaG9wIFRoZSBzaG9wIGluZm8gb2YgdGhpcyBQdXJjaGFzZUVudHJ5XG4gKiBAcHJvcGVydHkge1NILlB1cmNoYXNlRW50cnkuU1RBVFVTX1h9IHN0YXR1cyBTdGF0dXMgb2YgdGhpcyBQdXJjaGFzZUVudHJ5XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oU0gsIEFWKSB7XG5cdC8qKlxuXHQgKiBSZWNvbW1lbmRlZCB3YXkgdG9cblx0ICogSW5pdGlhbGl6ZSBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgQ2xhc3Ncblx0ICogQGZ1bmMgU0guUHVyY2hhc2VFbnRyeS5wcm90b3R5cGUubmV3XG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBbZGF0YV0gQW4ganNvbiBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgZGF0YVxuXHQgKiBAZXhhbXBsZSB2YXIgcHVyY2hhc2VFbnRyeSA9IFNILlB1cmNoYXNlRW50cnkubmV3KHtcImlkXCI6IFwiYWJjZFwiKTtcblx0ICovXG5cdFNILlB1cmNoYXNlRW50cnkgPSBBVi5PYmplY3QuZXh0ZW5kKFwiUHVyY2hhc2VFbnRyeVwiLCB7XG5cdFx0Ly9JbnN0YW5jZSB2YXJpYWJsZXNcblx0XHQvL0luc3RhbmNlIGZ1bmN0aW9uc1xuXHR9LCB7XG5cdFx0Ly9TdGF0aWMgdmFyaWFibGVzXG5cdFx0Ly9TdGF0aWMgZnVuY3Rpb25zXG5cdH0pO1xuXG5cdC8qKlxuXHQgKiBAbmFtZSBTSC5QdXJjaGFzZUVudHJ5LlNUQVRVU19YXG5cdCAqIEBkZXNjcmlwdGlvbiBTSC5QdXJjaGFzZUVudHJ5LlNUQVRVU19YIGlzIHRoZSBhdmFpbGFibGUgc3RhdHVzIGNvZGUgZGVzY3JpYmluZyB0aGUgc3RhdHVzIG9mIHRoZSBwdXJjaGFzZS5cblx0ICogQHByb3BlcnR5IHtpbnR9IFNUQVRVU19JTklUSUFURUQgU3RhdHVzIGNvZGUgaW5kaWNhdGluZyBwcm9kdWN0IGlzIHN0aWxsIGluLXN0b2NrIGFuZCBsaXN0aW5nLlxuXHQgKiBAcHJvcGVydHkge2ludH0gU1RBVFVTX1BBWU1FTlRfUkVDRUlWRUQgU3RhdHVzIGNvZGUgaW5kaWNhdGluZyBwcm9kdWN0IGlzIG9uIHByZS1vcmRlci5cblx0ICogQHByb3BlcnR5IHtpbnR9IFNUQVRVU19TVUNDRUVERUQgU3RhdHVzIGNvZGUgaW5kaWNhdGluZyBwcm9kdWN0IGlzIHNvbGQgb3V0LlxuXHQgKiBAcHJvcGVydHkge2ludH0gU1RBVFVTX0NBTkNFTExFRCBTdGF0dXMgY29kZSBpbmRpY2F0aW5nIHByb2R1Y3QgaXMgcmVwb3J0ZWQgYnkgdXNlci5cblx0ICogQHByb3BlcnR5IHtpbnR9IFNUQVRVU19ERUxFVEVEIFN0YXR1cyBjb2RlIGluZGljYXRpbmcgcHJvZHVjdCBpcyByZW1vdmVkIGZyb20gbGlzdGluZy5cblx0ICovXG5cblx0Ly9TSC5QdXJjaGFzZUVudHJ5LlNUQVRVU19JTklUSUFURUQgPSAwO1xuXHQvL1NILlB1cmNoYXNlRW50cnkuU1RBVFVTX1BFTkRJTkdfVkVORE9SX0RFVEFJTCA9IDEwMDtcblx0Ly9TSC5QdXJjaGFzZUVudHJ5LlNUQVRVU19QRU5ESU5HX1ZFTkRPUl9ERUxJVkVSWSA9IDE1MDtcblx0Ly9TSC5QdXJjaGFzZUVudHJ5LlNUQVRVU19QRU5ESU5HX0NVU1RPTUVSX0RFVEFJTCA9IDIwMDtcblx0Ly9TSC5QdXJjaGFzZUVudHJ5LlNUQVRVU19QRU5ESU5HX0NVU1RPTUVSX0RFTElWRVJZID0gMjUwO1xuXHQvL1NILlB1cmNoYXNlRW50cnkuU1RBVFVTX1NVQ0NFRURFRCA9IDYwMDtcblx0Ly9TSC5QdXJjaGFzZUVudHJ5LlNUQVRVU19DQU5DRUxMRUQgPSA3MDA7XG5cdC8vU0guUHVyY2hhc2VFbnRyeS5TVEFUVVNfUkVUVVJORUQgPSA4MDA7XG5cdC8vU0guUHVyY2hhc2VFbnRyeS5TVEFUVVNfREVMRVRFRCA9IDkwMDtcblxuXHRTSC5QdXJjaGFzZUVudHJ5LlNUQVRVU19JTklUSUFURUQgPSAwO1xuXHRTSC5QdXJjaGFzZUVudHJ5LlNUQVRVU19QQVlNRU5UX1JFQ0VJVkVEID0gMTAwO1xuXHRTSC5QdXJjaGFzZUVudHJ5LlNUQVRVU19TVUNDRUVERUQgPSA3MDA7XG5cdFNILlB1cmNoYXNlRW50cnkuU1RBVFVTX0NBTkNFTExFRCA9IDgwMDtcblx0U0guUHVyY2hhc2VFbnRyeS5TVEFUVVNfREVMRVRFRCA9IDkwMDtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KFNILlB1cmNoYXNlRW50cnkucHJvdG90eXBlLCBcImJ1eWVyXCIsIHtcblx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0KFwiYnV5ZXJcIik7XG5cdFx0fSxcblx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR0aGlzLnNldChcImJ1eWVyXCIsIHZhbHVlKTtcblx0XHR9XG5cdH0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guUHVyY2hhc2VFbnRyeS5wcm90b3R5cGUsIFwiY3VycmVuY3lcIiwge1xuXHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXQoXCJjdXJyZW5jeVwiKTtcblx0XHR9LFxuXHRcdHNldDogZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdHRoaXMuc2V0KFwiY3VycmVuY3lcIiwgdmFsdWUpO1xuXHRcdH1cblx0fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5QdXJjaGFzZUVudHJ5LnByb3RvdHlwZSwgXCJkZWxpdmVyeUFkZHJlc3NcIiwge1xuXHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXQoXCJkZWxpdmVyeUFkZHJlc3NcIik7XG5cdFx0fSxcblx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR0aGlzLnNldChcImRlbGl2ZXJ5QWRkcmVzc1wiLCB2YWx1ZSk7XG5cdFx0fVxuXHR9KTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guUHVyY2hhc2VFbnRyeS5wcm90b3R5cGUsIFwicHJvZHVjdFwiLCB7XG5cdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldChcInByb2R1Y3RcIik7XG5cdFx0fSxcblx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR0aGlzLnNldChcInByb2R1Y3RcIiwgdmFsdWUpO1xuXHRcdH1cblx0fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5QdXJjaGFzZUVudHJ5LnByb3RvdHlwZSwgXCJwdXJjaGFzZVByaWNlSW5DZW50XCIsIHtcblx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0KFwicHVyY2hhc2VQcmljZUluQ2VudFwiKTtcblx0XHR9LFxuXHRcdHNldDogZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdHRoaXMuc2V0KFwicHVyY2hhc2VQcmljZUluQ2VudFwiLCB2YWx1ZSk7XG5cdFx0fVxuXHR9KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KFNILlB1cmNoYXNlRW50cnkucHJvdG90eXBlLCBcInB1cmNoYXNlXCIsIHtcblx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0KFwicHVyY2hhc2VcIik7XG5cdFx0fSxcblx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR0aGlzLnNldChcInB1cmNoYXNlXCIsIHZhbHVlKTtcblx0XHR9XG5cdH0pO1xuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5QdXJjaGFzZUVudHJ5LnByb3RvdHlwZSwgXCJxdWFudGl0eVwiLCB7XG5cdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldChcInF1YW50aXR5XCIpO1xuXHRcdH0sXG5cdFx0c2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0dGhpcy5zZXQoXCJxdWFudGl0eVwiLCBwYXJzZUludCh2YWx1ZSkpO1xuXHRcdH1cblx0fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5QdXJjaGFzZUVudHJ5LnByb3RvdHlwZSwgXCJyYXRpbmdcIiwge1xuXHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXQoXCJyYXRpbmdcIik7XG5cdFx0fSxcblx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR0aGlzLnNldChcInJhdGluZ1wiLCBwYXJzZUludCh2YWx1ZSkpO1xuXHRcdH1cblx0fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5QdXJjaGFzZUVudHJ5LnByb3RvdHlwZSwgXCJzZWxsZXJcIiwge1xuXHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXQoXCJzZWxsZXJcIik7XG5cdFx0fSxcblx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR0aGlzLnNldChcInNlbGxlclwiLCB2YWx1ZSk7XG5cdFx0fVxuXHR9KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KFNILlB1cmNoYXNlRW50cnkucHJvdG90eXBlLCBcInNoaXBwaW5nXCIsIHtcblx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0KFwic2hpcHBpbmdcIik7XG5cdFx0fSxcblx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR0aGlzLnNldChcInNoaXBwaW5nXCIsIHZhbHVlKTtcblx0XHR9XG5cdH0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guUHVyY2hhc2VFbnRyeS5wcm90b3R5cGUsIFwic2hvcFwiLCB7XG5cdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldChcInNob3BcIik7XG5cdFx0fSxcblx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR0aGlzLnNldChcInNob3BcIiwgdmFsdWUpO1xuXHRcdH1cblx0fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5QdXJjaGFzZUVudHJ5LnByb3RvdHlwZSwgXCJzdGF0dXNcIiwge1xuXHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXQoXCJzdGF0dXNcIik7XG5cdFx0fSxcblx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR0aGlzLnNldChcInN0YXR1c1wiLCBwYXJzZUludCh2YWx1ZSkpO1xuXHRcdH1cblx0fSk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENsYXNzIGZvciBhbGwgUGFnZSBvYmplY3QgdXNlZCBpbiBTaGVsZiBzeXN0ZW1cbiAqIEBjbGFzcyBTSC5TaG9wXG4gKiBAbWVtYmVyb2YhIDxnbG9iYWw+XG4gKiBAYXV0aG9yIFh1amllIFNvbmdcbiAqIEBjb3B5cmlnaHQgU0s4IFBUWSBMVEQgMjAxNVxuICogQGV4dGVuZHMge0FWLk9iamVjdH1cbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vbGVhbmNsb3VkLmNuL2RvY3MvanNfZ3VpZGUuaHRtbCPlr7nosaEgQVYuT2JqZWN0fVxuICogQHByb3BlcnR5IHtTdHJpbmd9IGFib3V0UGFnZSBIVE1MIFN0cmluZyBvZiB0aGUgQWJvdXQgUGFnZVxuICogQHByb3BlcnR5IHtTSC5BZGRyZXNzfSBhZGRyZXNzIEFkZHJlc3Mgb2YgdGhpcyBTaG9wXG4gKiBAcHJvcGVydHkge1N0cmluZ30gY3VycmVuY3kgQ3VycmVuY3kgb2YgdGhpcyBTaG9wXG4gKiBAcHJvcGVydHkge1N0cmluZ30gZW1haWwgRW1haWwgb2YgdGhpcyBTaG9wXG4gKiBAcHJvcGVydHkge1N0cmluZ30gZmFjZWJvb2sgRmFjZWJvb2sgVVJMIG9mIHRoaXMgU2hvcFxuICogQHByb3BlcnR5IHtBVi5GaWxlfSBpY29uIEljb24gb2YgdGhpcyBTaG9wXG4gKiBAcHJvcGVydHkge1N0cmluZ30gaW5zdGFncmFtIEluc3RhZ3JhbSBVUkwgb2YgdGhpcyBTaG9wXG4gKiBAcHJvcGVydHkge0FWLkZpbGV9IGxlc3NGaWxlIExlc3NGaWxlIG9mIHRoaXMgU2hvcFxuICogQHByb3BlcnR5IHtBVi5GaWxlfSBsb2dvIExvZ28gb2YgdGhpcyBTaG9wXG4gKiBAcHJvcGVydHkge1N0cmluZ30gbWVudVRleHRDb2xvciBNZW51VGV4dENvbG9yIG9mIHRoaXMgU2hvcCwgaW4gaGV4IHN0cmluZ1xuICogQHByb3BlcnR5IHtTdHJpbmd9IG1lbnVUZXh0SG92ZXJDb2xvciBNZW51VGV4dEhvdmVyQ29sb3Igb2YgdGhpcyBTaG9wLCBpbiBoZXggc3RyaW5nXG4gKiBAcHJvcGVydHkge1N0cmluZ30gbmFtZSBOYW1lIG9mIHRoaXMgU2hvcFxuICogQHByb3BlcnR5IHtJbnR9IG5hdkxheW91dCBIVE1MIFN0cmluZyBvZiBOYXZMYXlvdXQgb2YgdGhpcyBTaG9wXG4gKiBAcHJvcGVydHkge0ludH0gbmF2U3R5bGUgSFRNTCBTdHJpbmcgTmF2U3R5bGUgb2YgdGhpcyBTaG9wXG4gKiBAcHJvcGVydHkge1NILlVzZXJ9IG93bmVyIE93bmVyIG9mIHRoaXMgU2hvcFxuICogQHByb3BlcnR5IHtTSC5QYWdlfSBwYWdlIFBhZ2Ugb2YgdGhpcyBTaG9wXG4gKiBAcHJvcGVydHkge09iamVjdH0gcm91dGluZyBSb3V0aW5nIG9mIHRoaXMgU2hvcFxuICogQHByb3BlcnR5IHtTdHJpbmd9IHdlY2hhdCBXZWNoYXQgSUQgb2YgdGhpcyBTaG9wXG4gKiBAcHJvcGVydHkge1N0cmluZ30gcGludGVyZXN0IFBpbnRlcmVzdCBVUkwgb2YgdGhpcyBTaG9wXG4gKiBAcHJvcGVydHkge1N0cmluZ30gcHJpbWFyeUNvbG9yIFByaW1hcnlDb2xvciBvZiB0aGlzIFNob3AsIGluIGhleCBzdHJpbmdcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBxcSBRUSBvZiB0aGlzIFNob3BcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBzaW5hV2VpYm8gU2luYVdlaWJvIFVSTCBvZiB0aGlzIFNob3BcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBzZWNvbmRhcnlDb2xvciBTZWNvbmRhcnlDb2xvciBvZiB0aGlzIFNob3AsIGluIGhleCBzdHJpbmdcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBzdWJVUkwgU3ViVVJMIG9mIHRoaXMgU2hvcFxuICogQHByb3BlcnR5IHtTdHJpbmd9IHN1bW1hcnkgU3VtbWFyeSBvZiB0aGlzIFNob3BcbiAqIEBwcm9wZXJ0eSB7QVYuRmlsZX0gdGFnbGluZSBUYWdsaW5lIG9mIHRoaXMgU2hvcFxuICogQHByb3BlcnR5IHtTdHJpbmd9IHR3aXR0ZXIgVHdpdHRlciBVUkwgb2YgdGhpcyBTaG9wXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oU0gsIEFWKSB7XG4gICAgLyoqXG4gICAgICogUmVjb21tZW5kZWQgd2F5IHRvXG4gICAgICogSW5pdGlhbGl6ZSBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgQ2xhc3NcbiAgICAgKiBAZnVuYyBTSC5TaG9wLnByb3RvdHlwZS5uZXdcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW2RhdGFdIEFuIGpzb24gb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIGRhdGFcbiAgICAgKiBAZXhhbXBsZSB2YXIgc2hvcCA9IFNILlNob3AubmV3KHtcImlkXCI6IFwiYWJjZFwiKTtcbiAgICAgKi9cbiAgICBTSC5TaG9wID0gQVYuT2JqZWN0LmV4dGVuZChcIlNob3BcIiwge1xuICAgICAgICAvL0luc3RhbmNlIHZhcmlhYmxlc1xuICAgICAgICAvL0luc3RhbmNlIGZ1bmN0aW9uc1xuICAgIH0sIHtcbiAgICAgICAgLy9TdGF0aWMgdmFyaWFibGVzXG4gICAgICAgIC8vU3RhdGljIGZ1bmN0aW9uc1xuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5TaG9wLnByb3RvdHlwZSwgXCJhYm91dFBhZ2VcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwiYWJvdXRQYWdlXCIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldChcImFib3V0UGFnZVwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guU2hvcC5wcm90b3R5cGUsIFwiYWRkcmVzc1wiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJhZGRyZXNzXCIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldChcImFkZHJlc3NcIiwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILlNob3AucHJvdG90eXBlLCBcImN1cnJlbmN5XCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldChcImN1cnJlbmN5XCIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldChcImN1cnJlbmN5XCIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5TaG9wLnByb3RvdHlwZSwgXCJlbWFpbFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJlbWFpbFwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJlbWFpbFwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guU2hvcC5wcm90b3R5cGUsIFwiZmFjZWJvb2tcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwiZmFjZWJvb2tcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwiZmFjZWJvb2tcIiwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILlNob3AucHJvdG90eXBlLCBcImljb25cIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwiaWNvblwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJpY29uXCIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5TaG9wLnByb3RvdHlwZSwgXCJpbnN0YWdyYW1cIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwiaW5zdGFncmFtXCIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldChcImluc3RhZ3JhbVwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guU2hvcC5wcm90b3R5cGUsIFwibGVzc0ZpbGVcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwibGVzc0ZpbGVcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwibGVzc0ZpbGVcIiwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILlNob3AucHJvdG90eXBlLCBcImxvZ29cIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwibG9nb1wiKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJsb2dvXCIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5TaG9wLnByb3RvdHlwZSwgXCJtZW51VGV4dENvbG9yXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldChcIm1lbnVUZXh0Q29sb3JcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwibWVudVRleHRDb2xvclwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guU2hvcC5wcm90b3R5cGUsIFwibWVudVRleHRIb3ZlckNvbG9yXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldChcIm1lbnVUZXh0SG92ZXJDb2xvclwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJtZW51VGV4dEhvdmVyQ29sb3JcIiwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILlNob3AucHJvdG90eXBlLCBcIm5hbWVcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwibmFtZVwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJuYW1lXCIsIHZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwic3ViVVJMXCIsIHZhbHVlLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILlNob3AucHJvdG90eXBlLCBcIm5hdkxheW91dFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJuYXZMYXlvdXRcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwibmF2TGF5b3V0XCIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5TaG9wLnByb3RvdHlwZSwgXCJuYXZTdHlsZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJuYXZTdHlsZVwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJuYXZTdHlsZVwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guU2hvcC5wcm90b3R5cGUsIFwib3duZXJcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwib3duZXJcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwib3duZXJcIiwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILlNob3AucHJvdG90eXBlLCBcInBhZ2VcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwicGFnZVwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJwYWdlXCIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5TaG9wLnByb3RvdHlwZSwgXCJyb3V0aW5nXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldChcInJvdXRpbmdcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwicm91dGluZ1wiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guU2hvcC5wcm90b3R5cGUsIFwid2VjaGF0XCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldChcIndlY2hhdFwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJ3ZWNoYXRcIiwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILlNob3AucHJvdG90eXBlLCBcInBpbnRlcmVzdFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJwaW50ZXJlc3RcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwicGludGVyZXN0XCIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5TaG9wLnByb3RvdHlwZSwgXCJwcmltYXJ5Q29sb3JcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwicHJpbWFyeUNvbG9yXCIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldChcInByaW1hcnlDb2xvclwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guU2hvcC5wcm90b3R5cGUsIFwicXFcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwicXFcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwicXFcIiwgcGFyc2VJbnQodmFsdWUpKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5TaG9wLnByb3RvdHlwZSwgXCJzaW5hV2VpYm9cIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwic2luYVdlaWJvXCIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldChcInNpbmFXZWlib1wiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guU2hvcC5wcm90b3R5cGUsIFwic2Vjb25kYXJ5Q29sb3JcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwic2Vjb25kYXJ5Q29sb3JcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwic2Vjb25kYXJ5Q29sb3JcIiwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILlNob3AucHJvdG90eXBlLCBcInN1YlVSTFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJzdWJVUkxcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwic3ViVVJMXCIsIHZhbHVlLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILlNob3AucHJvdG90eXBlLCBcInN1bW1hcnlcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwic3VtbWFyeVwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA8PSAxNDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldChcInN1bW1hcnlcIiwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILlNob3AucHJvdG90eXBlLCBcInRhZ2xpbmVcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwidGFnbGluZVwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJ0YWdsaW5lXCIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5TaG9wLnByb3RvdHlwZSwgXCJ0d2l0dGVyXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldChcInR3aXR0ZXJcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwidHdpdHRlclwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0aGUgY3VycmVudFNob3AgaXMgbGl2ZSBvbmxpbmVcbiAgICAgKiBAZnVuYyBTSC5TaG9wLnByb3RvdHlwZS5pc0xpdmVcbiAgICAgKiBAZXhhbXBsZSBpZiAoc2hvcC5pc0xpdmUoKSkge1xuICAgICAqICAgICAgLy9TaG9wIGlzIGxpdmVcbiAgICAgKiB9IGVsc2Uge1xuICAgICAqICAgICAgLy9TaG9wIGlzIHVuZGVyIGRldmVsb3BtZW50XG4gICAgICogfVxuICAgICAqL1xuICAgIFNILlNob3AucHJvdG90eXBlLmlzTGl2ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwibGl2ZVwiKTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2sgaWYgdGhlIGN1cnJlbnRTaG9wIGlzIGxpdmUgb25saW5lXG4gICAgICAgICAqIEBmdW5jIFNILlNob3AucHJvdG90eXBlLmdldFByb2R1Y3RRdWVyeVxuICAgICAgICAgKiBAZXhhbXBsZSB2YXIgcHJvZHVjdFF1ZXJ5ID0gc2hvcC5nZXRQcm9kdWN0UXVlcnkoKTtcbiAgICAgICAgICovXG4gICAgU0guU2hvcC5wcm90b3R5cGUuZ2V0UHJvZHVjdFF1ZXJ5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgcXVlcnkgPSBuZXcgQVYuUXVlcnkoU0guUHJvZHVjdCk7XG4gICAgICAgICAgICBxdWVyeS5lcXVhbFRvKFwic2hvcFwiLCB0aGlzKTtcbiAgICAgICAgICAgIHF1ZXJ5LmVxdWFsVG8oXCJzdGF0dXNcIiwgU0guUHJvZHVjdC5TVEFUVVNfTElTVElORyk7XG4gICAgICAgICAgICBxdWVyeS5pbmNsdWRlKFwiaW1hZ2VBcnJheVwiKTtcbiAgICAgICAgICAgIHF1ZXJ5LmluY2x1ZGUoXCJjYXRlZ29yeVwiKTtcbiAgICAgICAgICAgIHJldHVybiBxdWVyeTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2sgaWYgdGhlIGN1cnJlbnRTaG9wIGlzIGxpdmUgb25saW5lXG4gICAgICAgICAqIEBmdW5jIFNILlNob3AucHJvdG90eXBlLmdldENhdGVnb3J5UXVlcnlcbiAgICAgICAgICogQHJldHVybiB7QVYuUXVlcnl9IGNhdGVnb3J5UXVlcnkgVGhlIHF1ZXJ5IGNvbnRhaW5pbmcgYWxsIGNhdGVnb3JpZXMgZm9yIHRoaXMgc2hvcFxuICAgICAgICAgKiBAZXhhbXBsZSB2YXIgY2F0ZWdvcnlRdWVyeSA9IHNob3AuZ2V0Q2F0ZWdvcnlRdWVyeSgpO1xuICAgICAgICAgKi9cbiAgICBTSC5TaG9wLnByb3RvdHlwZS5nZXRDYXRlZ29yeVF1ZXJ5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgcXVlcnkgPSB0aGlzLnJlbGF0aW9uKFwiY2F0ZWdvcnlcIikucXVlcnkoKTtcbiAgICAgICAgICAgIHJldHVybiBxdWVyeTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IHF1ZXJ5IGZvciBhbGwgbWVtYmVyc2hpcCBjYXJkIHRoYXQncyBhc3NvY2lhdGVkIHdpdGggdGhpcyBzaG9wXG4gICAgICAgICAqIEBmdW5jIFNILlNob3AucHJvdG90eXBlLmdldE1lbWJlcnNoaXBRdWVyeVxuICAgICAgICAgKiBAZXhhbXBsZSB2YXIgbWVtYmVyc2hpcFF1ZXJ5ID0gc2hvcC5nZXRNZW1iZXJzaGlwUXVlcnkoKTtcbiAgICAgICAgICovXG4gICAgU0guU2hvcC5wcm90b3R5cGUuZ2V0TWVtYmVyc2hpcFF1ZXJ5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvL1JldHJpZXZlIE1lbWJlcnNoaXBcbiAgICAgICAgICAgIHZhciBxdWVyeSA9IG5ldyBBVi5RdWVyeShTSC5NZW1iZXJzaGlwKTtcbiAgICAgICAgICAgIHF1ZXJ5LmVxdWFsVG8oXCJzaG9wXCIsIHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIHF1ZXJ5O1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgdGhlIG1lbWJlcnNoaXAgb2JqZWN0IHRoYXQncyB3aXRoIHRoZSB1c2VyIGFuZCB0aGlzIHNob3BcbiAgICAgICAgICogQGZ1bmMgU0guU2hvcC5wcm90b3R5cGUuZ2V0TWVtYmVyc2hpcFxuICAgICAgICAgKiBAcGFyYW0ge1NILlVzZXJ9IHVzZXIgVGFyZ2V0IHVzZXIgc2hvcCBoYXMgbWVtYmVyc2hpcCB0b1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gY2FsbGJhY2sgQW4gb2JqZWN0IHRoYXQgaGFzIGFuIG9wdGlvbmFsIHN1Y2Nlc3MgZnVuY3Rpb24sIHRoYXQgdGFrZXMgbm8gYXJndW1lbnRzIGFuZCB3aWxsIGJlIGNhbGxlZCBvbiBhIHN1Y2Nlc3NmdWwgcHVzaCwgYW5kIGFuIGVycm9yIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYSBBVi5FcnJvciBhbmQgd2lsbCBiZSBjYWxsZWQgaWYgdGhlIHB1c2ggZmFpbGVkLlxuICAgICAgICAgKiBAZXhhbXBsZSBzaG9wLmdldE1lbWJlcnNoaXAodXNlciwge1xuICAgICAgICAgKiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKG1lbWJlcnNoaXApIHtcbiAgICAgICAgICogICAgICAgICAgLy9NZW1iZXJzaGlwIGRvd25sb2FkZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAqICAgICAgfSxcbiAgICAgICAgICogICAgICBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICogICAgICAgICAgLy9TSC5zaG93RXJyb3IoZXJyb3IpO1xuICAgICAgICAgKiAgICAgIH1cbiAgICAgICAgICogfSlcbiAgICAgICAgICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9sZWFuY2xvdWQuY24vZG9jcy9qc19ndWlkZS5odG1sI+afpeivouadoeS7tn1cbiAgICAgICAgICovXG4gICAgU0guU2hvcC5wcm90b3R5cGUuZ2V0TWVtYmVyc2hpcCA9IGZ1bmN0aW9uKHVzZXIsIGNhbGxiYWNrKSB7XG4gICAgICAgIC8vUmV0cmlldmUgTWVtYmVyc2hpcFxuICAgICAgICB2YXIgcXVlcnkgPSBuZXcgQVYuUXVlcnkoU0guTWVtYmVyc2hpcCk7XG4gICAgICAgIHF1ZXJ5LmVxdWFsVG8oXCJ1c2VyXCIsIHVzZXIpO1xuICAgICAgICBxdWVyeS5lcXVhbFRvKFwic2hvcFwiLCB0aGlzKTtcbiAgICAgICAgcXVlcnkuZmlyc3QoY2FsbGJhY2spO1xuICAgIH1cbn0iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ2xhc3MgZm9yIGFsbCBUcmFuc2FjdGlvbiBvYmplY3QgdXNlZCBpbiBTaGVsZiBzeXN0ZW1cbiAqIEBjbGFzcyBTSC5UcmFuc2FjdGlvblxuICogQG1lbWJlcm9mISA8Z2xvYmFsPlxuICogQGF1dGhvciBUaWFueWkgTGlcbiAqIEBjb3B5cmlnaHQgU0s4IFBUWSBMVEQgMjAxNVxuICogQGV4dGVuZHMge0FWLk9iamVjdH1cbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vbGVhbmNsb3VkLmNuL2RvY3MvanNfZ3VpZGUuaHRtbCPlr7nosaEgQVYuT2JqZWN0fVxuICogQHByb3BlcnR5IHtTdHJpbmd9IGN1cnJlbmN5XG4gKiBAcHJvcGVydHkge1NILlVzZXJ9IHBheWVlXG4gKiBAcHJvcGVydHkge1NILlVzZXJ9IHBheWVyXG4gKiBAcHJvcGVydHkge0ludH0gcHJpY2VJbkNlbnRcbiAqIEBwcm9wZXJ0eSB7U0guU2hvcH0gc2hvcFxuICogQHByb3BlcnR5IHtTdHJpbmd9IHN1bW1hcnlcbiAqIEBwcm9wZXJ0eSB7U0guUHVyY2hhc2V9IHB1cmNoYXNlXG4gKiBAcHJvcGVydHkge0ludH0gc3RhdHVzXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oU0gsIEFWKSB7XG4gIC8qKlxuICAgKiBSZWNvbW1lbmRlZCB3YXkgdG9cbiAgICogSW5pdGlhbGl6ZSBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgQ2xhc3NcbiAgICogQGZ1bmMgU0guVHJhbnNhY3Rpb24ucHJvdG90eXBlLm5ld1xuICAgKiBAcGFyYW0ge09iamVjdH0gW2RhdGFdIEFuIGpzb24gb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIGRhdGFcbiAgICogQGV4YW1wbGUgdmFyIHRyYW5zYWN0aW9uID0gU0guVHJhbnNhY3Rpb24ubmV3KHtcImlkXCI6IFwiYWJjZFwiKTtcbiAgICovXG4gIFNILlRyYW5zYWN0aW9uID0gQVYuT2JqZWN0LmV4dGVuZChcIlRyYW5zYWN0aW9uXCIsIHt9LCB7fSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILlRyYW5zYWN0aW9uLnByb3RvdHlwZSwgXCJjdXJyZW5jeVwiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldChcImN1cnJlbmN5XCIpO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgdGhpcy5zZXQoXCJjdXJyZW5jeVwiLCB2YWx1ZSk7XG4gICAgfVxuICB9KTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guVHJhbnNhY3Rpb24ucHJvdG90eXBlLCBcInBheWVlXCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwicGF5ZWVcIik7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICB0aGlzLnNldChcInBheWVlXCIsIHZhbHVlKTtcbiAgICB9XG4gIH0pO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5UcmFuc2FjdGlvbi5wcm90b3R5cGUsIFwicGF5ZXJcIiwge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXQoXCJwYXllclwiKTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHRoaXMuc2V0KFwicGF5ZXJcIiwgdmFsdWUpO1xuICAgIH1cbiAgfSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILlRyYW5zYWN0aW9uLnByb3RvdHlwZSwgXCJwcmljZUluQ2VudFwiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldChcInByaWNlSW5DZW50XCIpO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgdGhpcy5zZXQoXCJwcmljZUluQ2VudFwiLCB2YWx1ZSk7XG4gICAgfVxuICB9KTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guVHJhbnNhY3Rpb24ucHJvdG90eXBlLCBcInNob3BcIiwge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXQoXCJzaG9wXCIpO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgdGhpcy5zZXQoXCJzaG9wXCIsIHZhbHVlKTtcbiAgICB9XG4gIH0pO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5UcmFuc2FjdGlvbi5wcm90b3R5cGUsIFwic2hvcElkXCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwic2hvcElkXCIpO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgdGhpcy5zZXQoXCJzaG9wSWRcIiwgdmFsdWUpO1xuICAgIH1cbiAgfSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNILlRyYW5zYWN0aW9uLnByb3RvdHlwZSwgXCJzdW1tYXJ5XCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwic3VtbWFyeVwiKTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHRoaXMuc2V0KFwic3VtbWFyeVwiLCB2YWx1ZSk7XG4gICAgfVxuICB9KTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guVHJhbnNhY3Rpb24ucHJvdG90eXBlLCBcInB1cmNoYXNlXCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwicHVyY2hhc2VcIik7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICB0aGlzLnNldChcInB1cmNoYXNlXCIsIHZhbHVlKTtcbiAgICB9XG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guVHJhbnNhY3Rpb24ucHJvdG90eXBlLCBcInN0YXR1c1wiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldChcInN0YXR1c1wiKTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHRoaXMuc2V0KFwic3RhdHVzXCIsIHZhbHVlKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8qKlxuICAgKiBAbmFtZSBTSC5UcmFuc2FjdGlvbi5TVEFUVVNfWFxuICAgKiBAZGVzY3JpcHRpb24gU0guVHJhbnNhY3Rpb24uU1RBVFVTX1ggaXMgdGhlIGF2YWlsYWJsZSBzdGF0dXMgY29kZSBkZXNjcmliaW5nIHRoZSBzdGF0dXMgb2YgdGhlIHRyYW5zYWN0aW9uLlxuICAgKiBAcHJvcGVydHkge2ludH0gU1RBVFVTX0lOSVRJQUxJU0UgU3RhdHVzIGNvZGUgaW5kaWNhdGluZyB0cmFuc2FjdGlvbiBoYXMgYmVlbiBpbml0aWFsaXNlZC5cbiAgICogQHByb3BlcnR5IHtpbnR9IFNUQVRVU19DT01QTEVURSBTdGF0dXMgY29kZSBpbmRpY2F0aW5nIHRyYW5zYWN0aW9uIGlzIGNvbXBsZXRlZC5cbiAgICogQHByb3BlcnR5IHtpbnR9IFNUQVRVU19JTkNPTVBMRVRFIFN0YXR1cyBjb2RlIGluZGljYXRpbmcgdHJhbnNhY3Rpb24gaXMgaW5jb21wbGV0ZWQuXG5cbiAgICovXG4gIFNILlRyYW5zYWN0aW9uLlNUQVRVU19JTklUSUFMSVNFID0gMDtcbiAgU0guVHJhbnNhY3Rpb24uU1RBVFVTX0NPTVBMRVRFID0gMjAwO1xuICBTSC5UcmFuc2FjdGlvbi5TVEFUVVNfSU5DT01QTEVURSA9IDk5MDtcblxufSIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDbGFzcyBmb3IgYWxsIFVzZXIgb2JqZWN0IHVzZWQgaW4gU2hlbGYgc3lzdGVtXG4gKiBAY2xhc3MgU0guVXNlclxuICogQG1lbWJlcm9mISA8Z2xvYmFsPlxuICogQGF1dGhvciBYdWppZSBTb25nXG4gKiBAY29weXJpZ2h0IFNLOCBQVFkgTFREIDIwMTVcbiAqIEBleHRlbmRzIHtBVi5Vc2VyfVxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9sZWFuY2xvdWQuY24vZG9jcy9qc19ndWlkZS5odG1sI+eUqOaItyBBVi5Vc2VyfVxuICogQHByb3BlcnR5IHtTSC5BZGRyZXNzfSBhZGRyZXNzIFRoZSBwb2ludGVyIG9mIHRoZSBkZWZhdWx0IGFkZHJlc3Mgb2YgdGhpcyBfVXNlclxuICogQHByb3BlcnR5IHtPYmplY3R9IFthdXRoRGF0YV0gQXV0aERhdGEgb2YgdGhpcyBfVXNlclxuICogQHByb3BlcnR5IHtBVi5GaWxlfSBbYmFja2dyb3VuZEltYWdlXSBCYWNrZ3JvdW5kSW1hZ2Ugb2YgdGhpcyBfVXNlclxuICogQHByb3BlcnR5IHtTdHJpbmd9IGJpbyBCaW8gb2YgdGhpcyBfVXNlclxuICogQHByb3BlcnR5IHtTdHJpbmd9IGVtYWlsIEVtYWlsIG9mIHRoaXMgX1VzZXJcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBlbWFpbFZlcmlmaWVkIEVtYWlsVmVyaWZpZWQgb2YgdGhpcyBfVXNlclxuICogQHByb3BlcnR5IHtJbnR9IFtpbnN0YWxsYXRpb25JZF0gSW5zdGFsbGF0aW9uSWQgb2YgdGhpcyBfVXNlclxuICogQHByb3BlcnR5IHtJbnR9IG1lc3NlbmdlcklkIE1lc3NlbmdlcklkIG9mIHRoaXMgX1VzZXJcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBtZXNzZW5nZXJUb2tlbiBNZXNzZW5nZXJUb2tlbiBvZiB0aGlzIF9Vc2VyXG4gKiBAcHJvcGVydHkge1N0cmluZ30gbW9iaWxlTnVtYmVyIE1vYmlsZU51bWJlciBvZiB0aGlzIF9Vc2VyXG4gKiBAcHJvcGVydHkge1N0cmluZ30gbW9iaWxlUGhvbmVOdW1iZXIgTW9iaWxlTnVtYmVyIG9mIHRoaXMgX1VzZXJcbiAqIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbW9iaWxlUGhvbmVWZXJpZmllZCBNb2JpbGVQaG9uZVZlcmlmaWVkIG9mIHRoaXMgX1VzZXJcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBwYXNzd29yZCBQYXNzd29yZCBvZiB0aGlzIF9Vc2VyXG4gKiBAcHJvcGVydHkge0FWLkZpbGV9IFtwcm9maWxlSW1hZ2VdIFByb2ZpbGVJbWFnZSBvZiB0aGlzIF9Vc2VyXG4gKiBAcHJvcGVydHkge1N0cmluZ30gcHJvZmlsZU5hbWUgUHJvZmlsZU5hbWUgb2YgdGhpcyBfVXNlclxuICogQHByb3BlcnR5IHtGbG9hdH0gcmF0aW5nIFRoZSByYXRpbmcgb2YgdGhpcyBfVXNlclxuICogQHByb3BlcnR5IHtTdHJpbmd9IHJlYWxOYW1lIFJlYWxOYW1lIG9mIHRoaXMgX1VzZXJcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSB1c2VybmFtZSBVc2VybmFtZSBvZiB0aGlzIF9Vc2VyXG4gKiBAcHJvcGVydHkge1N0cmluZ30gdm9pcEFjY291bnQgVm9pcEFjY291bnQgb2YgdGhpcyBfVXNlclxuICogQHByb3BlcnR5IHtTdHJpbmd9IHZvaXBQYXNzd29yZCBWb2lwUGFzc3dvcmQgb2YgdGhpcyBfVXNlclxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChTSCwgQVYpIHtcbiAgICAvKipcbiAgICAgKiBSZWNvbW1lbmRlZCB3YXkgdG9cbiAgICAgKiBJbml0aWFsaXplIGEgbmV3IGluc3RhbmNlIG9mIHRoZSBDbGFzc1xuICAgICAqIEBmdW5jIFNILlVzZXIucHJvdG90eXBlLm5ld1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbZGF0YV0gQW4ganNvbiBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgZGF0YVxuICAgICAqIEBleGFtcGxlIHZhciB1c2VyID0gU0guVXNlci5uZXcoe1wiaWRcIjogXCJhYmNkXCIpO1xuICAgICAqL1xuICAgIFNILlVzZXIgPSBBVi5PYmplY3QuZXh0ZW5kKFwiX1VzZXJcIiwge1xuICAgICAgICAvL0luc3RhbmNlIHZhcmlhYmxlc1xuICAgICAgICAvL0luc3RhbmNlIGZ1bmN0aW9uc1xuICAgIH0sIHtcbiAgICAgICAgLy9TdGF0aWMgdmFyaWFibGVzXG4gICAgICAgIC8vU3RhdGljIGZ1bmN0aW9uc1xuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5Vc2VyLnByb3RvdHlwZSwgXCJhZGRyZXNzXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYWRkcmVzcyA9IHRoaXMuZ2V0KFwiYWRkcmVzc1wiKTtcbiAgICAgICAgICAgIGlmIChhZGRyZXNzICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhZGRyZXNzO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhZGRyZXNzID0gU0guQWRkcmVzcy5uZXcoKTtcbiAgICAgICAgICAgICAgICBhZGRyZXNzLnVzZXIgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0KFwiYWRkcmVzc1wiLCBhZGRyZXNzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRkcmVzcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwiYWRkcmVzc1wiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guVXNlci5wcm90b3R5cGUsIFwiYXV0aERhdGFcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldChcImF1dGhEYXRhXCIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJhdXRoRGF0YVwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guVXNlci5wcm90b3R5cGUsIFwiYmFja2dyb3VuZEltYWdlXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJiYWNrZ3JvdW5kSW1hZ2VcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldChcImJhY2tncm91bmRJbWFnZVwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guVXNlci5wcm90b3R5cGUsIFwiYmlvXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJiaW9cIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldChcImJpb1wiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guVXNlci5wcm90b3R5cGUsIFwiZW1haWxcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldChcImVtYWlsXCIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJlbWFpbFwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guVXNlci5wcm90b3R5cGUsIFwiZW1haWxWZXJpZmllZFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwiZW1haWxWZXJpZmllZFwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwiZW1haWxWZXJpZmllZFwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guVXNlci5wcm90b3R5cGUsIFwiaW5zdGFsbGF0aW9uSWRcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldChcImluc3RhbGxhdGlvbklkXCIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJpbnN0YWxsYXRpb25JZFwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guVXNlci5wcm90b3R5cGUsIFwibWVzc2VuZ2VySWRcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldChcIm1lc3NlbmdlcklkXCIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJtZXNzZW5nZXJJZFwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guVXNlci5wcm90b3R5cGUsIFwibWVzc2VuZ2VyVG9rZW5cIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldChcIm1lc3NlbmdlclRva2VuXCIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJtZXNzZW5nZXJUb2tlblwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guVXNlci5wcm90b3R5cGUsIFwibW9iaWxlTnVtYmVyXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJtb2JpbGVOdW1iZXJcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldChcIm1vYmlsZU51bWJlclwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guVXNlci5wcm90b3R5cGUsIFwicGFzc3dvcmRcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldChcInBhc3N3b3JkXCIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJwYXNzd29yZFwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guVXNlci5wcm90b3R5cGUsIFwicHJvZmlsZUltYWdlXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJwcm9maWxlSW1hZ2VcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldChcInByb2ZpbGVJbWFnZVwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guVXNlci5wcm90b3R5cGUsIFwicHJvZmlsZU5hbWVcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldChcInByb2ZpbGVOYW1lXCIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoXCJwcm9maWxlTmFtZVwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU0guVXNlci5wcm90b3R5cGUsIFwicmF0aW5nXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJyYXRpbmdcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldChcInJhdGluZ1wiLCBwYXJzZUZsb2F0KHZhbHVlKS50b0ZpeGVkKDEpKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5Vc2VyLnByb3RvdHlwZSwgXCJyZWFsTmFtZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwicmVhbE5hbWVcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldChcInJlYWxOYW1lXCIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5Vc2VyLnByb3RvdHlwZSwgXCJ1c2VybmFtZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwidXNlcm5hbWVcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldChcInVzZXJuYW1lXCIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5Vc2VyLnByb3RvdHlwZSwgXCJ2b2lwQWNjb3VudFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwidm9pcEFjY291bnRcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldChcInZvaXBBY2NvdW50XCIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTSC5Vc2VyLnByb3RvdHlwZSwgXCJ2b2lwUGFzc3dvcmRcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldChcInZvaXBQYXNzd29yZFwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KFwidm9pcFBhc3N3b3JkXCIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIC8qKlxuICAgICAqIGlzVXNlciBtZXRob2QgY2hlY2sgaWYgdHdvIHVzZXIgb2JqZWN0cyBhcmUgZXF1aXZhbGVudCB0byBlYWNoIG90aGVyXG4gICAgICogQHBhcmFtIHtTSC5Vc2VyfSB1c2VyIFRhcmdldCB1c2VyIHRvIGNvbXBhcmVcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSBib29sZWFuIFRydWUgaWYgdHdvIHVzZXJzIGFyZSB0aGUgZXF1aXZhbGVudCwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgICovXG4gICAgU0guVXNlci5wcm90b3R5cGUuaXNVc2VyID0gZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgaWYgKHVzZXIgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pZCA9PSB1c2VyLmlkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIGlzVXNlciBtZXRob2QgY2hlY2sgaWYgdHdvIHVzZXIgb2JqZWN0cyBhcmUgZXF1aXZhbGVudCB0byBlYWNoIG90aGVyXG4gICAgICogQGZ1bmMgU0guVXNlci5wcm90b3R5cGUuaGFzTGlrZWRQcm9kdWN0XG4gICAgICogQHBhcmFtIHtTSC5Qcm9kdWN0fSBwcm9kdWN0IFRhcmdldCBwcm9kdWN0IHVzZXIgd2lzaGVzIHRvIGxpa2VcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY2FsbGJhY2sgQW4gZnVuY3Rpb24gd2l0aCBhIGJvb2xlYW4gdmFyaWFibGUgaW5kaWNhdGluZyBpZiB1c2VyIGhhZCBsaWtlZCB0aGUgcHJvZHVjdC5cbiAgICAgKiBAc2VlIHtAbGluayBodHRwczovL2xlYW5jbG91ZC5jbi9kb2NzL2pzX2d1aWRlLmh0bWwj5L+d5a2Y5a+56LGhIH1cbiAgICAgKiBAZXhhbXBsZSB1c2VyLmhhc0xpa2VkUHJvZHVjdChwcm9kdWN0LCBmdW5jdGlvbihsaWtlZCkge1xuICAgICAgICAgKiAgICAgIGlmIChsaWtlZCkge1xuICAgICAgICAgKiAgICAgICAgICAvL1VzZXIgaGFkIGxpa2VkIHRoZSBwcm9kdWN0XG4gICAgICAgICAqICAgICAgfSBlbHNlIHtcbiAgICAgICAgICogICAgICAgICAgVXNlciBoYWQgbm90IGxpa2VkIHRoZSBwcm9kdWN0XG4gICAgICAgICAqICAgICAgfVxuICAgICAgICAgKiB9KTtcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSBib29sZWFuIFRydWUgaWYgdHdvIHVzZXJzIGFyZSB0aGUgZXF1aXZhbGVudCwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgICovXG4gICAgU0guVXNlci5wcm90b3R5cGUuaGFzTGlrZWRQcm9kdWN0ID0gZnVuY3Rpb24gKHByb2R1Y3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBxdWVyeSA9IHRoaXMuZ2V0UHJvZHVjdExpa2VkUmVsYXRpb24oKS5xdWVyeSgpO1xuICAgICAgICB2YXIgcHJvZHVjdElkID0gcHJvZHVjdC5pZDtcbiAgICAgICAgcXVlcnkuZXF1YWxUbyhcIm9iamVjdElkXCIsIHByb2R1Y3RJZCk7XG4gICAgICAgIHF1ZXJ5LmNvdW50KCkudGhlbihmdW5jdGlvbiAoY291bnQpIHtcbiAgICAgICAgICAgIHZhciBsaWtlZCA9IChjb3VudCA9PSAxKTtcbiAgICAgICAgICAgIGNhbGxiYWNrKGxpa2VkKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhmYWxzZSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0aGUgdXNlciBoYXMgdmVyaWZpZWQgaGlzL2hlciBlbWFpbFxuICAgICAqIEBmdW5jIFNILlVzZXIucHJvdG90eXBlLmhhc1ZlcmlmaWVkRW1haWxcbiAgICAgKiBAZXhhbXBsZSBpZiAodXNlci5oYXNWZXJpZmllZEVtYWlsKCkpIHtcbiAgICAgICAgICogICAgICAvL1VzZXIgaGFkIHZlcmlmaWVkIGhpcy9oZXIgZW1haWxcbiAgICAgICAgICogfSBlbHNlIHtcbiAgICAgICAgICogICAgICAvL1VzZXIgaGFkIG5vdCB2ZXJpZmllZCBoaXMvaGVyIGVtYWlsXG4gICAgICAgICAqIH1cbiAgICAgKi9cbiAgICBTSC5Vc2VyLnByb3RvdHlwZS5oYXNWZXJpZmllZEVtYWlsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoXCJlbWFpbFZlcmlmaWVkXCIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0aGUgdXNlciBoYXMgdmVyaWZpZWQgaGlzL2hlciBtb2JpbGUgbnVtYmVyXG4gICAgICogQGZ1bmMgU0guVXNlci5wcm90b3R5cGUuaGFzVmVyaWZpZWRNb2JpbGVOdW1iZXJcbiAgICAgKiBAZXhhbXBsZSBpZiAodXNlci5oYXNWZXJpZmllZE1vYmlsZU51bWJlcigpKSB7XG4gICAgICAgICAqICAgICAgLy9Vc2VyIGhhZCB2ZXJpZmllZCBoaXMvaGVyIG1vYmlsZSBudW1iZXJcbiAgICAgICAgICogfSBlbHNlIHtcbiAgICAgICAgICogICAgICAvL1VzZXIgaGFkIG5vdCB2ZXJpZmllZCBoaXMvaGVyIG1vYmlsZSBudW1iZXJcbiAgICAgICAgICogfVxuICAgICAqL1xuICAgIFNILlVzZXIucHJvdG90eXBlLmhhc1ZlcmlmaWVkTW9iaWxlTnVtYmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbW9iaWxlTnVtYmVyID0gdGhpcy5nZXRNb2JpbGVOdW1iZXIoKTtcbiAgICAgICAgcmV0dXJuIG1vYmlsZU51bWJlciAhPSBudWxsO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVc2VyIGxpa2UvZGlzbGlrZSBhIHBhcnRpY3VsYXIgcHJvZHVjdFxuICAgICAqIEBmdW5jIFNILlVzZXIucHJvdG90eXBlLmxpa2VQcm9kdWN0XG4gICAgICogQHBhcmFtIHtTSC5Qcm9kdWN0fSBwcm9kdWN0IFRhcmdldCBwcm9kdWN0IHVzZXIgd2lzaGVzIHRvIGxpa2VcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGxpa2UgVHJ1ZSBpZiB1c2VyICdsaWtlICd0aGUgcHJvZHVjdCwgRmFsc2UgaWYgdXNlciAnZGlzbGlrZScgaXQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtjYWxsYmFja10gQW4gb2JqZWN0IHRoYXQgaGFzIGFuIG9wdGlvbmFsIHN1Y2Nlc3MgZnVuY3Rpb24sIHRoYXQgdGFrZXMgbm8gYXJndW1lbnRzIGFuZCB3aWxsIGJlIGNhbGxlZCBvbiBhIHN1Y2Nlc3NmdWwgcHVzaCwgYW5kIGFuIGVycm9yIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYSBBVi5FcnJvciBhbmQgd2lsbCBiZSBjYWxsZWQgaWYgdGhlIHB1c2ggZmFpbGVkLlxuICAgICAqIEBleGFtcGxlIHVzZXIubGlrZVByb2R1Y3QocHJvZHVjdCwgbGlrZSwge1xuICAgICAgICAgKiAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAqICAgICAgICAgICAgICAvL1VzZXIgbGlrZWQvZGlzbGlrZWQgdGhlIHByb2R1Y3RcbiAgICAgICAgICogICAgICAgICAgfSxcbiAgICAgICAgICogICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAqICAgICAgICAgICAgICAvL1NILnNob3dFcnJvcihlcnJvcik7XG4gICAgICAgICAqICAgICAgICAgIH1cbiAgICAgICAgICogfSlcbiAgICAgKi9cbiAgICBTSC5Vc2VyLnByb3RvdHlwZS5saWtlUHJvZHVjdCA9IGZ1bmN0aW9uIChwcm9kdWN0LCBsaWtlLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmVsYXRpb24gPSB0aGlzLmdldFByb2R1Y3RMaWtlZFJlbGF0aW9uKCk7XG4gICAgICAgIGlmIChsaWtlKSB7XG4gICAgICAgICAgICByZWxhdGlvbi5hZGQocHJvZHVjdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWxhdGlvbi5yZW1vdmUocHJvZHVjdCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zYXZlKGNhbGxiYWNrKTtcbiAgICAgICAgLy8gU2VuZCBhIG5vdGlmaWNhdGlvbiB0byB0aGUgb3duZXI7XG4gICAgICAgIHZhciBtZXNzc2FnZSA9IHRoaXMuZ2V0UHJvZmlsZU5hbWUoKSArIFwiIGp1c3QgbGlrZWQgeW91ciBcIiArIHByb2R1Y3QuZ2V0TmFtZSgpO1xuICAgICAgICAvLyBUT0RPXG4gICAgICAgIFNILnNlbmRQdXNoKHtcbiAgICAgICAgICAgIGNxbDogXCJzZWxlY3QgKiBmcm9tIF9JbnN0YWxsYXRpb24gd2hlcmUgdXNlcj1cIiArIHRoaXMsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgYWxlcnQ6IG1lc3NzYWdlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIG1lbWJlcnNoaXAgb2JqZWN0IHRoYXQncyB3aXRoIHRoZSB1c2VyIGFuZCB0aGlzIHNob3BcbiAgICAgKiBAZnVuYyBTSC5Vc2VyLnByb3RvdHlwZS5nZXRNZW1iZXJzaGlwXG4gICAgICogQHBhcmFtIHtTSC5TaG9wfSBzaG9wIFRhcmdldCBzaG9wIHVzZXIgaGFzIG1lbWJlcnNoaXAgdG9cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW2NhbGxiYWNrXSBBbiBvYmplY3QgdGhhdCBoYXMgYW4gb3B0aW9uYWwgc3VjY2VzcyBmdW5jdGlvbiwgdGhhdCB0YWtlcyBubyBhcmd1bWVudHMgYW5kIHdpbGwgYmUgY2FsbGVkIG9uIGEgc3VjY2Vzc2Z1bCBwdXNoLCBhbmQgYW4gZXJyb3IgZnVuY3Rpb24gdGhhdCB0YWtlcyBhIEFWLkVycm9yIGFuZCB3aWxsIGJlIGNhbGxlZCBpZiB0aGUgcHVzaCBmYWlsZWQuXG4gICAgICogQGV4YW1wbGUgdXNlci5nZXRNZW1iZXJzaGlwKHNob3AsIHtcbiAgICAgICAgICogICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24obWVtYmVyc2hpcCkge1xuICAgICAgICAgKiAgICAgICAgICAgICAgLy9NZW1iZXJzaGlwIGRvd25sb2FkZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAqICAgICAgICAgIH0sXG4gICAgICAgICAqICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgKiAgICAgICAgICAgICAgLy9TSC5zaG93RXJyb3IoZXJyb3IpO1xuICAgICAgICAgKiAgICAgICAgICB9XG4gICAgICAgICAqICAgICAgfSlcbiAgICAgKiBAc2VlIHtAbGluayBodHRwczovL2xlYW5jbG91ZC5jbi9kb2NzL2pzX2d1aWRlLmh0bWwj5p+l6K+i5p2h5Lu2fVxuICAgICAqL1xuICAgIFNILlVzZXIucHJvdG90eXBlLmdldE1lbWJlcnNoaXAgPSBmdW5jdGlvbiAoc2hvcCwgY2FsbGJhY2spIHtcbiAgICAgICAgLy9SZXRyaWV2ZSBNZW1iZXJzaGlwXG4gICAgICAgIHZhciBxdWVyeSA9IG5ldyBBVi5RdWVyeShTSC5NZW1iZXJzaGlwKTtcbiAgICAgICAgcXVlcnkuZXF1YWxUbyhcInVzZXJcIiwgdGhpcyk7XG4gICAgICAgIHF1ZXJ5LmVxdWFsVG8oXCJzaG9wXCIsIHNob3ApO1xuICAgICAgICBxdWVyeS5maXJzdChjYWxsYmFjayk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgcmVsYXRpb24gdG8gbGlrZWQgcHJvZHVjdFxuICAgICAqIEBmdW5jIFNILlVzZXIucHJvdG90eXBlLmdldFByb2R1Y3RMaWtlZFJlbGF0aW9uXG4gICAgICogQHJldHVybiB7QVYuUmVsYXRpb259IHJlbGF0aW9uIFRoZSByZWxhdGlvbiBvZiBsaWtlZCBwcm9kdWN0XG4gICAgICogQGV4YW1wbGUgdmFyIHByb2R1Y3RMaWtlZFJlbGF0aW9uID0gdXNlci5nZXRQcm9kdWN0TGlrZWRSZWxhdGlvbigpO1xuICAgICAqL1xuICAgIFNILlVzZXIucHJvdG90eXBlLmdldFByb2R1Y3RMaWtlZFJlbGF0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWxhdGlvbihcInByb2R1Y3RMaWtlZFwiKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IHRoZSByZWxhdGlvbiB0byBsaWtlZCBzaG9wXG4gICAgICogQGZ1bmMgU0guVXNlci5wcm90b3R5cGUuZ2V0U2hvcExpa2VkXG4gICAgICogQHJldHVybiB7QVYuUmVsYXRpb259IHJlbGF0aW9uIFRoZSByZWxhdGlvbiBvZiBsaWtlZCBzaG9wXG4gICAgICogQGV4YW1wbGUgdmFyIHNob3BGb2xsb3dlZFJlbGF0aW9uID0gdXNlci5nZXRTaG9wTGlrZWQoKTtcbiAgICAgKi9cbiAgICBTSC5Vc2VyLnByb3RvdHlwZS5nZXRTaG9wTGlrZWRSZWxhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVsYXRpb24oXCJzaG9wTGlrZWRcIik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVzZSB0aGUgdG9rZW4gcmV0dXJuIGZyb20gU3RyaXBlLCBhbmQgdXBkYXRlIHVzZXJcbiAgICAgKiBAZnVuYyBTSC5Vc2VyLnByb3RvdHlwZS51cGRhdGVDYXJkXG4gICAgICogQHBhcmFtIHRva2VuXG4gICAgICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9zdHJpcGUuY29tL2RvY3MvYXBpL25vZGUjY3JlYXRlX2NhcmR9XG4gICAgICovXG4gICAgU0guVXNlci5wcm90b3R5cGUudXBkYXRlQ2FyZCA9IGZ1bmN0aW9uICh0b2tlbikge1xuICAgICAgICB2YXIgcGFyYW1zID0ge1xuICAgICAgICAgICAgXCJ0b2tlbklkXCI6IHRva2VuLmlkXG4gICAgICAgIH07XG4gICAgICAgIEFWLkNsb3VkLnJ1bigndXBkYXRlQ2FyZCcsIHBhcmFtcyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgcmVsYXRpb24gdG8gYWxsIGFkZHJlc3Nlc1xuICAgICAqIEBmdW5jIFNILlVzZXIucHJvdG90eXBlLmdldEFkZHJlc3NSZWxhdGlvblxuICAgICAqIEByZXR1cm4ge0FWLlJlbGF0aW9ufSByZWxhdGlvbiBUaGUgcmVsYXRpb24gb2YgYWxsIGFkZHJlc3Nlc1xuICAgICAqIEBleGFtcGxlIHZhciBhZGRyZXNzUmVsYXRpb24gPSB1c2VyLmdldEFkZHJlc3NSZWxhdGlvbigpO1xuICAgICAqL1xuICAgIFNILlVzZXIucHJvdG90eXBlLmdldEFkZHJlc3NSZWxhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVsYXRpb24oXCJhZGRyZXNzUmVsYXRpb25cIik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZCBhZGRyZXNzIHRvIHVzZXIgYWRkcmVzcyByZWxhdGlvblxuICAgICAqIEBmdW5jIFNILlVzZXIucHJvdG90eXBlLmFkZEFkZHJlc3NcbiAgICAgKiBAcGFyYW0ge1NILkFkZHJlc3N9IGFkZHJlc3NcbiAgICAgKi9cbiAgICBTSC5Vc2VyLnByb3RvdHlwZS5hZGRBZGRyZXNzID0gZnVuY3Rpb24gKGFkZHJlc3MpIHtcbiAgICAgICAgdGhpcy5nZXRBZGRyZXNzUmVsYXRpb24oKS5hZGQoYWRkcmVzcyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhZGRyZXNzIGZyb20gdXNlciBhZGRyZXNzIHJlbGF0aW9uXG4gICAgICogQGZ1bmMgU0guVXNlci5wcm90b3R5cGUucmVtb3ZlQWRkcmVzc1xuICAgICAqIEBwYXJhbSB7U0guQWRkcmVzc30gYWRkcmVzc1xuICAgICAqL1xuICAgIFNILlVzZXIucHJvdG90eXBlLnJlbW92ZUFkZHJlc3MgPSBmdW5jdGlvbiAoYWRkcmVzcykge1xuICAgICAgICB0aGlzLmdldEFkZHJlc3NSZWxhdGlvbigpLnJlbW92ZShhZGRyZXNzKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU3Vic2NyaWJlIHRvIGEgcGFydGljdWxhciBzaG9wXG4gICAgICogQGZ1bmMgU0guVXNlci5wcm90b3R5cGUuc3Vic2NyaWJlXG4gICAgICogQHBhcmFtIHtTSC5TaG9wfSBzaG9wXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtjYWxsYmFja10gQW4gb2JqZWN0IHRoYXQgaGFzIGFuIG9wdGlvbmFsIHN1Y2Nlc3MgZnVuY3Rpb24sIHRoYXQgdGFrZXMgbm8gYXJndW1lbnRzIGFuZCB3aWxsIGJlIGNhbGxlZCBvbiBhIHN1Y2Nlc3NmdWwgcHVzaCwgYW5kIGFuIGVycm9yIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYSBBVi5FcnJvciBhbmQgd2lsbCBiZSBjYWxsZWQgaWYgdGhlIHB1c2ggZmFpbGVkLlxuICAgICAqIEBleGFtcGxlIHVzZXIuc3Vic2NyaWJlKHNob3AsIHtcbiAgICAgKiAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICogICAgICAgICAgICAgIC8vVXBkYXRlZCB1c2VyXG4gICAgICogICAgICAgICAgfSxcbiAgICAgKiAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgKiAgICAgICAgICAgICAgLy9TSC5zaG93RXJyb3IoZXJyb3IpO1xuICAgICAqICAgICAgICAgIH1cbiAgICAgKiAgICAgIH0pO1xuICAgICAqL1xuICAgIFNILlVzZXIucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uIChzaG9wLCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmFkZFVuaXF1ZShcInN1YnNjcmliZWRTaG9wXCIsIHNob3AuaWQpO1xuICAgICAgICB0aGlzLnNhdmUoY2FsbGJhY2spO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBGb2xsb3cgdG8gYSBwYXJ0aWN1bGFyIHVzZXJcbiAgICAgKiBAZnVuYyBTSC5Vc2VyLnByb3RvdHlwZS5mb2xsb3dcbiAgICAgKiBAcGFyYW0ge1NILlVzZXJ9IHVzZXJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW2NhbGxiYWNrXSBBbiBvYmplY3QgdGhhdCBoYXMgYW4gb3B0aW9uYWwgc3VjY2VzcyBmdW5jdGlvbiwgdGhhdCB0YWtlcyBubyBhcmd1bWVudHMgYW5kIHdpbGwgYmUgY2FsbGVkIG9uIGEgc3VjY2Vzc2Z1bCBwdXNoLCBhbmQgYW4gZXJyb3IgZnVuY3Rpb24gdGhhdCB0YWtlcyBhIEFWLkVycm9yIGFuZCB3aWxsIGJlIGNhbGxlZCBpZiB0aGUgcHVzaCBmYWlsZWQuXG4gICAgICogQGV4YW1wbGUgdXNlci5mb2xsb3codXNlciwge1xuICAgICAqICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgKiAgICAgICAgICAgICAgLy9VcGRhdGVkIHVzZXJcbiAgICAgKiAgICAgICAgICB9LFxuICAgICAqICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuICAgICAqICAgICAgICAgICAgICAvL1NILnNob3dFcnJvcihlcnJvcik7XG4gICAgICogICAgICAgICAgfVxuICAgICAqICAgICAgfSk7XG4gICAgICovXG4gICAgLyoqXG4gICAgICogVW5mb2xsb3cgdG8gYSBwYXJ0aWN1bGFyIHVzZXJcbiAgICAgKiBAZnVuYyBTSC5Vc2VyLnByb3RvdHlwZS51bmZvbGxvd1xuICAgICAqIEBwYXJhbSB7U0guVXNlcn0gdXNlclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbY2FsbGJhY2tdIEFuIG9iamVjdCB0aGF0IGhhcyBhbiBvcHRpb25hbCBzdWNjZXNzIGZ1bmN0aW9uLCB0aGF0IHRha2VzIG5vIGFyZ3VtZW50cyBhbmQgd2lsbCBiZSBjYWxsZWQgb24gYSBzdWNjZXNzZnVsIHB1c2gsIGFuZCBhbiBlcnJvciBmdW5jdGlvbiB0aGF0IHRha2VzIGEgQVYuRXJyb3IgYW5kIHdpbGwgYmUgY2FsbGVkIGlmIHRoZSBwdXNoIGZhaWxlZC5cbiAgICAgKiBAZXhhbXBsZSB1c2VyLnVuZm9sbG93KHVzZXIsIHtcbiAgICAgKiAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICogICAgICAgICAgICAgIC8vVXBkYXRlZCB1c2VyXG4gICAgICogICAgICAgICAgfSxcbiAgICAgKiAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgKiAgICAgICAgICAgICAgLy9TSC5zaG93RXJyb3IoZXJyb3IpO1xuICAgICAqICAgICAgICAgIH1cbiAgICAgKiAgICAgIH0pO1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIGZvbGxvd2VlIHF1ZXJ5IHRvIHF1ZXJ5IHRoZSB1c2VyJ3MgZm9sbG93ZWVzLlxuICAgICAqIEBmdW5jIFNILlVzZXIucHJvdG90eXBlLmZvbGxvd2VlUXVlcnkoKVxuICAgICAqIEBleGFtcGxlIHZhciBmb2xsb3dlZVF1ZXJ5ID0gdXNlci5mb2xsb3dlZVF1ZXJ5KCk7XG4gICAgICovXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgZm9sbG93ZXIgcXVlcnkgdG8gcXVlcnkgdGhlIHVzZXIncyBmb2xsb3dlcnMuXG4gICAgICogQGZ1bmMgU0guVXNlci5wcm90b3R5cGUuZm9sbG93ZXJRdWVyeSgpXG4gICAgICogQGV4YW1wbGUgdmFyIGZvbGxvd2VyUXVlcnkgPSB1c2VyLmZvbGxvd2VyUXVlcnkoKTtcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIFNpZ25zIHVwIGEgbmV3IHVzZXIuIFlvdSBzaG91bGQgY2FsbCB0aGlzIGluc3RlYWQgb2Ygc2F2ZSBmb3JcbiAgICAgKiBuZXcgU0guVXNlcnMuIFRoaXMgd2lsbCBjcmVhdGUgYSBuZXcgU0guVXNlciBvbiB0aGUgc2VydmVyLCBhbmRcbiAgICAgKiBhbHNvIHBlcnNpc3QgdGhlIHNlc3Npb24gb24gZGlzayBzbyB0aGF0IHlvdSBjYW4gYWNjZXNzIHRoZSB1c2VyIHVzaW5nXG4gICAgICogPGNvZGU+Y3VycmVudDwvY29kZT4uXG4gICAgICpcbiAgICAgKiA8cD5BIHVzZXJuYW1lIGFuZCBwYXNzd29yZCBtdXN0IGJlIHNldCBiZWZvcmUgY2FsbGluZyBzaWduVXAuPC9wPlxuICAgICAqXG4gICAgICogPHA+Q2FsbHMgb3B0aW9ucy5zdWNjZXNzIG9yIG9wdGlvbnMuZXJyb3Igb24gY29tcGxldGlvbi48L3A+XG4gICAgICpcbiAgICAgKiBAZnVuYyBTSC5Vc2VyLnNpZ25VcFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRycyBFeHRyYSBmaWVsZHMgdG8gc2V0IG9uIHRoZSBuZXcgdXNlciwgb3IgbnVsbC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBBIEJhY2tib25lLXN0eWxlIG9wdGlvbnMgb2JqZWN0LlxuICAgICAqIEByZXR1cm4ge0FWLlByb21pc2V9IEEgcHJvbWlzZSB0aGF0IGlzIGZ1bGZpbGxlZCB3aGVuIHRoZSBzaWdudXBcbiAgICAgKiAgICAgZmluaXNoZXMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAgICAgIHZhciB1c2VyID0gU0guVXNlci5uZXcoKTtcbiAgICAgKiAgICAgIHVzZXIudXNlcm5hbWUgPSBcIjEzMzM0MjMwMUAxNjMuY29tXCI7XG4gICAgICogICAgICB1c2VyLnBhc3N3b3JkID0gXCJhYmNkZWZnXCI7XG4gICAgICogICAgICB1c2VyLnNpZ25VcChudWxsLCB7XG4gICAgICogICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgKiAgICAgICAgICAvLyDms6jlhozmiJDlip/vvIzlj6/ku6Xkvb/nlKjkuoYuXG4gICAgICogICAgICAgIH0sXG4gICAgICogICAgICAgIGVycm9yOiBmdW5jdGlvbih1c2VyLCBlcnJvcikge1xuICAgICAqICAgICAgICAgIC8vU0guc2hvd0Vycm9yKGVycm9yKTtcbiAgICAgKiAgICAgICAgfVxuICAgICAqICAgICAgfSk7XG4gICAgICovXG4gICAgLyoqXG4gICAgICogU2lnbnMgdXAgYSBuZXcgdXNlciB3aXRoIG1vYmlsZSBwaG9uZSBhbmQgc21zIGNvZGUuXG4gICAgICogWW91IHNob3VsZCBjYWxsIHRoaXMgaW5zdGVhZCBvZiBzYXZlIGZvclxuICAgICAqIG5ldyBBVi5Vc2Vycy4gVGhpcyB3aWxsIGNyZWF0ZSBhIG5ldyBBVi5Vc2VyIG9uIHRoZSBzZXJ2ZXIsIGFuZFxuICAgICAqIGFsc28gcGVyc2lzdCB0aGUgc2Vzc2lvbiBvbiBkaXNrIHNvIHRoYXQgeW91IGNhbiBhY2Nlc3MgdGhlIHVzZXIgdXNpbmdcbiAgICAgKiA8Y29kZT5jdXJyZW50PC9jb2RlPi5cbiAgICAgKlxuICAgICAqIDxwPkEgdXNlcm5hbWUgYW5kIHBhc3N3b3JkIG11c3QgYmUgc2V0IGJlZm9yZSBjYWxsaW5nIHNpZ25VcC48L3A+XG4gICAgICpcbiAgICAgKiA8cD5DYWxscyBvcHRpb25zLnN1Y2Nlc3Mgb3Igb3B0aW9ucy5lcnJvciBvbiBjb21wbGV0aW9uLjwvcD5cbiAgICAgKlxuICAgICAqIEBmdW5jIFNILlVzZXIuc2lnblVwT3Jsb2dJbldpdGhNb2JpbGVQaG9uZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRycyBFeHRyYSBmaWVsZHMgdG8gc2V0IG9uIHRoZSBuZXcgdXNlciwgb3IgbnVsbC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBBIEJhY2tib25lLXN0eWxlIG9wdGlvbnMgb2JqZWN0LlxuICAgICAqIEByZXR1cm4ge0FWLlByb21pc2V9IEEgcHJvbWlzZSB0aGF0IGlzIGZ1bGZpbGxlZCB3aGVuIHRoZSBzaWdudXBcbiAgICAgKiAgICAgZmluaXNoZXMuXG4gICAgICogQHNlZSBAbGluayBodHRwczovL2xlYW5jbG91ZC5jbi9kb2NzL2pzX2d1aWRlLmh0bWwj5omL5py65Y+356CB5LiA6ZSu55m75b2VIEFWLkNsb3VkLnJlcXVlc3RTbXNDb2RlfVxuICAgICAqIEBleGFtcGxlXG4gICAgICogICAgICB2YXIgdXNlciA9IFNILlVzZXIubmV3KCk7XG4gICAgICogICAgICB1c2VyLnVzZXJuYW1lID0gXCIxMzMzNDIzMDFAMTYzLmNvbVwiO1xuICAgICAqICAgICAgdXNlci5wYXNzd29yZCA9IFwiYWJjZGVmZ1wiO1xuICAgICAqICAgICAgdXNlci5zaWduVXBPcmxvZ0luV2l0aE1vYmlsZVBob25lKHtcbiAgICAgKiAgICAgICAgbW9iaWxlUGhvbmVOdW1iZXI6ICcxODZ4eHh4eHh4eCcsXG4gICAgICogICAgICAgIHNtc0NvZGU6ICfmiYvmnLrmlLbliLDnmoQgNiDkvY3pqozor4HnoIHlrZfnrKbkuLInLFxuICAgICAqICAgICAgICB1c2VybmFtZTogXCJmZWVkYmFja0BzazguYXNpYVwiLFxuICAgICAqICAgICAgICBwYXNzd3JvZDogXCIxMjM0NTY3OFwiXG4gICAgICogICAgICAgIG90aGVyUHJvcGVydHk6IG90aGVyVmFsdWVcbiAgICAgKiAgICAgIH0sIHtcbiAgICAgKiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuICAgICAqICAgICAgICAgIC8vIOazqOWGjOaIkOWKn++8jOWPr+S7peS9v+eUqOS6hi5cbiAgICAgKiAgICAgICAgfSxcbiAgICAgKiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHVzZXIsIGVycm9yKSB7XG4gICAgICogICAgICAgICAgLy9TSC5zaG93RXJyb3IoZXJyb3IpO1xuICAgICAqICAgICAgICB9XG4gICAgICogICAgICB9KTtcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIExvZ3MgaW4gYSB1c2VyIHdpdGggYSBtb2JpbGUgcGhvbmUgbnVtYmVyIGFuZCBwYXNzd29yZC4gT24gc3VjY2VzcywgdGhpc1xuICAgICAqIHNhdmVzIHRoZSBzZXNzaW9uIHRvIGRpc2ssIHNvIHlvdSBjYW4gcmV0cmlldmUgdGhlIGN1cnJlbnRseSBsb2dnZWQgaW5cbiAgICAgKiB1c2VyIHVzaW5nIDxjb2RlPmN1cnJlbnQ8L2NvZGU+LlxuICAgICAqXG4gICAgICogPHA+Q2FsbHMgb3B0aW9ucy5zdWNjZXNzIG9yIG9wdGlvbnMuZXJyb3Igb24gY29tcGxldGlvbi48L3A+XG4gICAgICpcbiAgICAgKiBAZnVuYyBTSC5Vc2VyLmxvZ0luV2l0aE1vYmlsZVBob25lXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG1vYmlsZVBob25lIFRoZSB1c2VyJ3MgbW9iaWxlUGhvbmVOdW1iZXJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGFzc3dvcmQgVGhlIHBhc3N3b3JkIHRvIGxvZyBpbiB3aXRoLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIEEgQmFja2JvbmUtc3R5bGUgb3B0aW9ucyBvYmplY3QuXG4gICAgICogQHJldHVybiB7QVYuUHJvbWlzZX0gQSBwcm9taXNlIHRoYXQgaXMgZnVsZmlsbGVkIHdpdGggdGhlIHVzZXIgd2hlblxuICAgICAqICAgICB0aGUgbG9naW4gY29tcGxldGVzLlxuICAgICAqIEBzZWUgQGxpbmsgaHR0cHM6Ly9sZWFuY2xvdWQuY24vZG9jcy9qc19ndWlkZS5odG1sI+aJi+acuuWPt+eggeWSjOefreS/oeeZu+W9lSBBVi5Vc2VyLmxvZ0luV2l0aE1vYmlsZVBob25lfVxuICAgICAqIEBleGFtcGxlXG4gICAgICogICAgICBTSC5Vc2VyLmxvZ0luV2l0aE1vYmlsZVBob25lKCcxODZ4eHh4eHh4eCcsIHBhc3N3b3JkLCB7XG4gICAgICogICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgKiAgICAgICAgICAvLyDms6jlhozmiJDlip/vvIzlj6/ku6Xkvb/nlKjkuoYuXG4gICAgICogICAgICAgIH0sXG4gICAgICogICAgICAgIGVycm9yOiBmdW5jdGlvbih1c2VyLCBlcnJvcikge1xuICAgICAqICAgICAgICAgIC8vU0guc2hvd0Vycm9yKGVycm9yKTtcbiAgICAgKiAgICAgICAgfVxuICAgICAqICAgICAgfSk7XG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBMb2dzIG91dCB0aGUgY3VycmVudGx5IGxvZ2dlZCBpbiB1c2VyIHNlc3Npb24uIFRoaXMgd2lsbCByZW1vdmUgdGhlXG4gICAgICogc2Vzc2lvbiBmcm9tIGRpc2ssIGxvZyBvdXQgb2YgbGlua2VkIHNlcnZpY2VzLCBhbmQgZnV0dXJlIGNhbGxzIHRvXG4gICAgICogPGNvZGU+Y3VycmVudDwvY29kZT4gd2lsbCByZXR1cm4gPGNvZGU+bnVsbDwvY29kZT4uXG4gICAgICogQGZ1bmMgU0guVXNlci5sb2dPdXRcbiAgICAgKiBAZXhhbXBsZSBTSC5Vc2VyLmxvZ091dCgpO1xuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogUmVxdWVzdHMgYSBwYXNzd29yZCByZXNldCBlbWFpbCB0byBiZSBzZW50IHRvIHRoZSBzcGVjaWZpZWQgZW1haWwgYWRkcmVzc1xuICAgICAqIGFzc29jaWF0ZWQgd2l0aCB0aGUgdXNlciBhY2NvdW50LiBUaGlzIGVtYWlsIGFsbG93cyB0aGUgdXNlciB0byBzZWN1cmVseVxuICAgICAqIHJlc2V0IHRoZWlyIHBhc3N3b3JkIG9uIHRoZSBBViBzaXRlLlxuICAgICAqXG4gICAgICogPHA+Q2FsbHMgb3B0aW9ucy5zdWNjZXNzIG9yIG9wdGlvbnMuZXJyb3Igb24gY29tcGxldGlvbi48L3A+XG4gICAgICpcbiAgICAgKiBAZnVuYyBTSC5Vc2VyLnJlcXVlc3RQYXNzd29yZFJlc2V0XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGVtYWlsIFRoZSBlbWFpbCBhZGRyZXNzIGFzc29jaWF0ZWQgd2l0aCB0aGUgdXNlciB0aGF0XG4gICAgICogICAgIGZvcmdvdCB0aGVpciBwYXNzd29yZC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBBIEJhY2tib25lLXN0eWxlIG9wdGlvbnMgb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICogICAgICBTSC5Vc2VyLnJlcXVlc3RQYXNzd29yZFJlc2V0KFwiZW1haWxAZXhhbXBsZS5jb21cIiwge1xuICAgICAqICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgKiAgICAgICAgICAvLyBQYXNzd29yZCByZXNldCByZXF1ZXN0IHdhcyBzZW50IHN1Y2Nlc3NmdWxseVxuICAgICAqICAgICAgICB9LFxuICAgICAqICAgICAgICBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgKiAgICAgICAgICAvL1NILnNob3dFcnJvcihlcnJvcik7XG4gICAgICogICAgICB9KTtcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIFJlcXVlc3RzIGEgdmVyaWZ5IGVtYWlsIHRvIGJlIHNlbnQgdG8gdGhlIHNwZWNpZmllZCBlbWFpbCBhZGRyZXNzXG4gICAgICogYXNzb2NpYXRlZCB3aXRoIHRoZSB1c2VyIGFjY291bnQuIFRoaXMgZW1haWwgYWxsb3dzIHRoZSB1c2VyIHRvIHNlY3VyZWx5XG4gICAgICogdmVyaWZ5IHRoZWlyIGVtYWlsIGFkZHJlc3Mgb24gdGhlIEFWIHNpdGUuXG4gICAgICpcbiAgICAgKiA8cD5DYWxscyBvcHRpb25zLnN1Y2Nlc3Mgb3Igb3B0aW9ucy5lcnJvciBvbiBjb21wbGV0aW9uLjwvcD5cbiAgICAgKlxuICAgICAqIEBmdW5jIFNILlVzZXIucmVxdWVzdEVtYWlsVmVyaWZ5XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGVtYWlsIFRoZSBlbWFpbCBhZGRyZXNzIGFzc29jaWF0ZWQgd2l0aCB0aGUgdXNlciB0aGF0XG4gICAgICogICAgIGRvZXNuJ3QgdmVyaWZ5IHRoZWlyIGVtYWlsIGFkZHJlc3MuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgQSBCYWNrYm9uZS1zdHlsZSBvcHRpb25zIG9iamVjdC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqICAgICAgU0guVXNlci5yZXF1ZXN0RW1haWxWZXJpZnkoXCJlbWFpbEBleGFtcGxlLmNvbVwiLCB7XG4gICAgICogICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAqICAgICAgICAgIC8vIFZlcmlmaWNhdGlvbiBlbWFpbCB3YXMgc2VudCBzdWNjZXNzZnVsbHlcbiAgICAgKiAgICAgICAgfSxcbiAgICAgKiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICogICAgICAgICAgLy9TSC5zaG93RXJyb3IoZXJyb3IpO1xuICAgICAqICAgICAgfSk7XG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0cyBhIHZlcmlmeSBzbXMgY29kZSB0byBiZSBzZW50IHRvIHRoZSBzcGVjaWZpZWQgbW9iaWxlIHBob25lXG4gICAgICogbnVtYmVyIGFzc29jaWF0ZWQgd2l0aCB0aGUgdXNlciBhY2NvdW50LiBUaGlzIHNtcyBjb2RlIGFsbG93cyB0aGUgdXNlciB0b1xuICAgICAqIHZlcmlmeSB0aGVpciBtb2JpbGUgcGhvbmUgbnVtYmVyIGJ5IGNhbGxpbmcgQVYuVXNlci52ZXJpZnlNb2JpbGVQaG9uZVxuICAgICAqXG4gICAgICogPHA+Q2FsbHMgb3B0aW9ucy5zdWNjZXNzIG9yIG9wdGlvbnMuZXJyb3Igb24gY29tcGxldGlvbi48L3A+XG4gICAgICpcbiAgICAgKiBAZnVuYyBTSC5Vc2VyLnJlcXVlc3RNb2JpbGVQaG9uZVZlcmlmeVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtb2JpbGVQaG9uZSBUaGUgbW9iaWxlIHBob25lIG51bWJlciAgYXNzb2NpYXRlZCB3aXRoIHRoZVxuICAgICAqICAgICAgICAgICAgICAgICAgdXNlciB0aGF0IGRvZXNuJ3QgdmVyaWZ5IHRoZWlyIG1vYmlsZSBwaG9uZSBudW1iZXIuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgQSBCYWNrYm9uZS1zdHlsZSBvcHRpb25zIG9iamVjdC5cbiAgICAgKiBAZXhtYXBsZVxuICAgICAqICAgICAgQVYuVXNlci5yZXF1ZXN0TW9iaWxlUGhvbmVWZXJpZnkoJzE4Nnh4eHh4eHh4JykudGhlbihmdW5jdGlvbigpe1xuICAgICAqICAgICAgICAvL+WPkemAgeaIkOWKn1xuICAgICAqICAgICAgfSwgZnVuY3Rpb24oZXJyKXtcbiAgICAgKiAgICAgICAgIC8vU0guc2hvd0Vycm9yKGVycm9yKTtcbiAgICAgKiAgICAgIH0pO1xuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogUmVxdWVzdHMgYSByZXNldCBwYXNzd29yZCBzbXMgY29kZSB0byBiZSBzZW50IHRvIHRoZSBzcGVjaWZpZWQgbW9iaWxlIHBob25lXG4gICAgICogbnVtYmVyIGFzc29jaWF0ZWQgd2l0aCB0aGUgdXNlciBhY2NvdW50LiBUaGlzIHNtcyBjb2RlIGFsbG93cyB0aGUgdXNlciB0b1xuICAgICAqIHJlc2V0IHRoZWlyIGFjY291bnQncyBwYXNzd29yZCBieSBjYWxsaW5nIEFWLlVzZXIucmVzZXRQYXNzd29yZEJ5U21zQ29kZVxuICAgICAqXG4gICAgICogPHA+Q2FsbHMgb3B0aW9ucy5zdWNjZXNzIG9yIG9wdGlvbnMuZXJyb3Igb24gY29tcGxldGlvbi48L3A+XG4gICAgICpcbiAgICAgKiBAZnVuYyBTSC5Vc2VyLnJlcXVlc3RQYXNzd29yZFJlc2V0QnlTbXNDb2RlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG1vYmlsZVBob25lIFRoZSBtb2JpbGUgcGhvbmUgbnVtYmVyICBhc3NvY2lhdGVkIHdpdGggdGhlXG4gICAgICogICAgICAgICAgICAgICAgICB1c2VyIHRoYXQgZG9lc24ndCB2ZXJpZnkgdGhlaXIgbW9iaWxlIHBob25lIG51bWJlci5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBBIEJhY2tib25lLXN0eWxlIG9wdGlvbnMgb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICogICAgICBTSC5Vc2VyLnJlcXVlc3RQYXNzd29yZFJlc2V0QnlTbXNDb2RlKFwiMTg2eHh4eHh4eHhcIiwge1xuICAgICAqICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgKiAgICAgICAgICAvLyBQYXNzd29yZCByZXNldCByZXF1ZXN0IHdhcyBzZW50IHN1Y2Nlc3NmdWxseVxuICAgICAqICAgICAgICB9LFxuICAgICAqICAgICAgICBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgKiAgICAgICAgICAvL1NILnNob3dFcnJvcihlcnJvcik7XG4gICAgICogICAgICB9KTtcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiBNYWtlcyBhIGNhbGwgdG8gcmVzZXQgdXNlcidzIGFjY291bnQgcGFzc3dvcmQgYnkgc21zIGNvZGUgYW5kIG5ldyBwYXNzd29yZC5cbiAgICAgKiBUaGUgc21zIGNvZGUgaXMgc2VudCBieSBBVi5Vc2VyLnJlcXVlc3RQYXNzd29yZFJlc2V0QnlTbXNDb2RlLlxuICAgICAqIEBmdW5jIFNILlVzZXIucmVzZXRQYXNzd29yZEJ5U21zQ29kZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb2RlIFRoZSBzbXMgY29kZSBzZW50IGJ5IEFWLlVzZXIuQ2xvdWQucmVxdWVzdFNtc0NvZGVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGFzc3dvcmQgVGhlIG5ldyBwYXNzd29yZC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBBIEJhY2tib25lLXN0eWxlIG9wdGlvbnMgb2JqZWN0XG4gICAgICogQHJldHVybiB7QVYuUHJvbWlzZX0gQSBwcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZCB3aXRoIHRoZSByZXN1bHRcbiAgICAgKiBvZiB0aGUgZnVuY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAgICAgIFNILlVzZXIucmVxdWVzdFBhc3N3b3JkUmVzZXRCeVNtc0NvZGUoXCIxMjM0NTZcIiwgXCJuZXdQYXNzd29yZFwiLCB7XG4gICAgICogICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAqICAgICAgICAgIC8vIFBhc3N3b3JkIHJlc2V0IHJlcXVlc3Qgd2FzIHNlbnQgc3VjY2Vzc2Z1bGx5XG4gICAgICogICAgICAgIH0sXG4gICAgICogICAgICAgIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuICAgICAqICAgICAgICAgIC8vU0guc2hvd0Vycm9yKGVycm9yKTtcbiAgICAgKiAgICAgIH0pO1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIE1ha2VzIGEgY2FsbCB0byB2ZXJpZnkgc21zIGNvZGUgdGhhdCBzZW50IGJ5IEFWLlVzZXIuQ2xvdWQucmVxdWVzdFNtc0NvZGVcbiAgICAgKiBJZiB2ZXJpZnkgc3VjY2Vzc2Z1bGx5LHRoZSB1c2VyIG1vYmlsZVBob25lVmVyaWZpZWQgYXR0cmlidXRlIHdpbGwgYmUgdHJ1ZS5cbiAgICAgKiBAZnVuYyBTSC5Vc2VyLnZlcmlmeU1vYmlsZVBob25lXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNvZGUgVGhlIHNtcyBjb2RlIHNlbnQgYnkgQVYuVXNlci5DbG91ZC5yZXF1ZXN0U21zQ29kZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIEEgQmFja2JvbmUtc3R5bGUgb3B0aW9ucyBvYmplY3RcbiAgICAgKiBAcmV0dXJuIHtBVi5Qcm9taXNlfSBBIHByb21pc2UgdGhhdCB3aWxsIGJlIHJlc29sdmVkIHdpdGggdGhlIHJlc3VsdFxuICAgICAqIG9mIHRoZSBmdW5jdGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqICAgICAgU0guVXNlci52ZXJpZnlNb2JpbGVQaG9uZShcIjEyMzQ1NlwiLCB7XG4gICAgICogICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAqICAgICAgICAgIC8vIFBhc3N3b3JkIHJlc2V0IHJlcXVlc3Qgd2FzIHNlbnQgc3VjY2Vzc2Z1bGx5XG4gICAgICogICAgICAgIH0sXG4gICAgICogICAgICAgIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuICAgICAqICAgICAgICAgIC8vU0guc2hvd0Vycm9yKGVycm9yKTtcbiAgICAgKiAgICAgIH0pO1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIFJlcXVlc3RzIGEgbG9nSW4gc21zIGNvZGUgdG8gYmUgc2VudCB0byB0aGUgc3BlY2lmaWVkIG1vYmlsZSBwaG9uZVxuICAgICAqIG51bWJlciBhc3NvY2lhdGVkIHdpdGggdGhlIHVzZXIgYWNjb3VudC4gVGhpcyBzbXMgY29kZSBhbGxvd3MgdGhlIHVzZXIgdG9cbiAgICAgKiBsb2dpbiBieSBBVi5Vc2VyLmxvZ0luV2l0aE1vYmlsZVBob25lU21zQ29kZSBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIDxwPkNhbGxzIG9wdGlvbnMuc3VjY2VzcyBvciBvcHRpb25zLmVycm9yIG9uIGNvbXBsZXRpb24uPC9wPlxuICAgICAqXG4gICAgICogQGZ1bmMgU0guVXNlci5yZXF1ZXN0TG9naW5TbXNDb2RlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG1vYmlsZVBob25lIFRoZSBtb2JpbGUgcGhvbmUgbnVtYmVyICBhc3NvY2lhdGVkIHdpdGggdGhlXG4gICAgICogICAgICAgICAgIHVzZXIgdGhhdCB3YW50IHRvIGxvZ2luIGJ5IEFWLlVzZXIubG9nSW5XaXRoTW9iaWxlUGhvbmVTbXNDb2RlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgQSBCYWNrYm9uZS1zdHlsZSBvcHRpb25zIG9iamVjdC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqICAgICAgU0guVXNlci5yZXF1ZXN0TG9naW5TbXNDb2RlKCcxODZ4eHh4eHh4eCcsIHtcbiAgICAgKiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oKSB7XG4gICAgICogICAgICAgICAgLy8gUGFzc3dvcmQgcmVzZXQgcmVxdWVzdCB3YXMgc2VudCBzdWNjZXNzZnVsbHlcbiAgICAgKiAgICAgICAgfSxcbiAgICAgKiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICogICAgICAgICAgLy9TSC5zaG93RXJyb3IoZXJyb3IpO1xuICAgICAqICAgICAgfSk7XG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBMb2dzIGluIGEgdXNlciB3aXRoIGEgbW9iaWxlIHBob25lIG51bWJlciBhbmQgc21zIGNvZGUgc2VudCBieVxuICAgICAqIEFWLlVzZXIucmVxdWVzdExvZ2luU21zQ29kZS5PbiBzdWNjZXNzLCB0aGlzXG4gICAgICogc2F2ZXMgdGhlIHNlc3Npb24gdG8gZGlzaywgc28geW91IGNhbiByZXRyaWV2ZSB0aGUgY3VycmVudGx5IGxvZ2dlZCBpblxuICAgICAqIHVzZXIgdXNpbmcgPGNvZGU+Y3VycmVudDwvY29kZT4uXG4gICAgICpcbiAgICAgKiA8cD5DYWxscyBvcHRpb25zLnN1Y2Nlc3Mgb3Igb3B0aW9ucy5lcnJvciBvbiBjb21wbGV0aW9uLjwvcD5cbiAgICAgKlxuICAgICAqIEBmdW5jIFNILlVzZXIubG9nSW5XaXRoTW9iaWxlUGhvbmVTbXNDb2RlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG1vYmlsZVBob25lIFRoZSB1c2VyJ3MgbW9iaWxlUGhvbmVOdW1iZXJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc21zQ29kZSBUaGUgc21zIGNvZGUgc2VudCBieSBBVi5Vc2VyLnJlcXVlc3RMb2dpblNtc0NvZGVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBBIEJhY2tib25lLXN0eWxlIG9wdGlvbnMgb2JqZWN0LlxuICAgICAqIEByZXR1cm4ge0FWLlByb21pc2V9IEEgcHJvbWlzZSB0aGF0IGlzIGZ1bGZpbGxlZCB3aXRoIHRoZSB1c2VyIHdoZW5cbiAgICAgKiAgICAgdGhlIGxvZ2luIGNvbXBsZXRlcy5cbiAgICAgKiBAZnVuYyBTSC5Vc2VyI2xvZ0luXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAgICAgIFNILlVzZXIubG9nSW5XaXRoTW9iaWxlUGhvbmVTbXNDb2RlKFwiMTg2eHh4eHh4eHhcIiwgXCIxMjM0NTZcIiwge1xuICAgICAqICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgKiAgICAgICAgICAvLyBQYXNzd29yZCByZXNldCByZXF1ZXN0IHdhcyBzZW50IHN1Y2Nlc3NmdWxseVxuICAgICAqICAgICAgICB9LFxuICAgICAqICAgICAgICBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgKiAgICAgICAgICAvL1NILnNob3dFcnJvcihlcnJvcik7XG4gICAgICogICAgICB9KTtcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIExvZ3MgaW4gYSBBVi5Vc2VyLiBPbiBzdWNjZXNzLCB0aGlzIHNhdmVzIHRoZSBzZXNzaW9uIHRvIGxvY2FsU3RvcmFnZSxcbiAgICAgKiBzbyB5b3UgY2FuIHJldHJpZXZlIHRoZSBjdXJyZW50bHkgbG9nZ2VkIGluIHVzZXIgdXNpbmdcbiAgICAgKiA8Y29kZT5jdXJyZW50PC9jb2RlPi5cbiAgICAgKlxuICAgICAqIDxwPkEgdXNlcm5hbWUgYW5kIHBhc3N3b3JkIG11c3QgYmUgc2V0IGJlZm9yZSBjYWxsaW5nIGxvZ0luLjwvcD5cbiAgICAgKlxuICAgICAqIDxwPkNhbGxzIG9wdGlvbnMuc3VjY2VzcyBvciBvcHRpb25zLmVycm9yIG9uIGNvbXBsZXRpb24uPC9wPlxuICAgICAqXG4gICAgICogQGZ1bmMgU0guVXNlci5wcm90b3R5cGUubG9nSW5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBBIEJhY2tib25lLXN0eWxlIG9wdGlvbnMgb2JqZWN0LlxuICAgICAqIEBmdW5jIFNILlVzZXIubG9nSW5cbiAgICAgKiBAcmV0dXJuIHtBVi5Qcm9taXNlfSBBIHByb21pc2UgdGhhdCBpcyBmdWxmaWxsZWQgd2l0aCB0aGUgdXNlciB3aGVuXG4gICAgICogICAgIHRoZSBsb2dpbiBpcyBjb21wbGV0ZS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqICAgICAgQVYuVXNlci5sb2dJbihcIm15VXNlcm5hbWVcIiwgXCJteVBhc3N3b3JkXCIsIHtcbiAgICAgKiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuICAgICAqICAgICAgICAgIC8vIOaIkOWKn+S6hu+8jOeOsOWcqOWPr+S7peWBmuWFtuS7luS6i+aDheS6hi5cbiAgICAgKiAgICAgICAgfSxcbiAgICAgKiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHVzZXIsIGVycm9yKSB7XG4gICAgICogICAgICAgICAgLy9TSC5zaG93RXJyb3IoZXJyb3IpO1xuICAgICAqICAgICAgICB9XG4gICAgICogICAgICB9KTtcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSB1c2VyJ3MgbmV3IHBhc3N3b3JkIHNhZmVseSBiYXNlZCBvbiBvbGQgcGFzc3dvcmQuXG4gICAgICogQGZ1bmMgU0guVXNlci5wcm90b3R5cGVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gb2xkUGFzc3dvcmQsIHRoZSBvbGQgcGFzc3dvcmQuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5ld1Bhc3N3b3JkLCB0aGUgbmV3IHBhc3N3b3JkLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBBbiBvcHRpb25hbCBCYWNrYm9uZS1saWtlIG9wdGlvbnMgb2JqZWN0IHdpdGhcbiAgICAgKiAgICAgc3VjY2VzcyBhbmQgZXJyb3IgY2FsbGJhY2tzIHRoYXQgd2lsbCBiZSBpbnZva2VkIG9uY2UgdGhlIGl0ZXJhdGlvblxuICAgICAqICAgICBoYXMgZmluaXNoZWQuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAgICAgIHZhciB1c2VyID0gQVYuVXNlci5jdXJyZW50KCk7XG4gICAgICogICAgICB1c2VyLnVwZGF0ZVBhc3N3b3JkKCdjdXJyZW50UGFzc3dvcmQnLCAnbmV3UGFzc3dvcmQnLCB7XG4gICAgICogICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCl7XG4gICAgICogICAgICAgICAgLy/mm7TmlrDmiJDlip9cbiAgICAgKiAgICAgICAgfSxcbiAgICAgKiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHVzZXIsIGVycil7XG4gICAgICogICAgICAgICAgLy9TSC5zaG93RXJyb3IoZXJyb3IpO1xuICAgICAqICAgICAgICB9XG4gICAgICogICAgICB9KTtcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIExvZ3MgaW4gYSB1c2VyIHdpdGggYSBzZXNzaW9uIHRva2VuLiBPbiBzdWNjZXNzLCB0aGlzIHNhdmVzIHRoZSBzZXNzaW9uXG4gICAgICogdG8gZGlzaywgc28geW91IGNhbiByZXRyaWV2ZSB0aGUgY3VycmVudGx5IGxvZ2dlZCBpbiB1c2VyIHVzaW5nXG4gICAgICogPGNvZGU+Y3VycmVudDwvY29kZT4uXG4gICAgICpcbiAgICAgKiA8cD5DYWxscyBvcHRpb25zLnN1Y2Nlc3Mgb3Igb3B0aW9ucy5lcnJvciBvbiBjb21wbGV0aW9uLjwvcD5cbiAgICAgKlxuICAgICAqIEBmdW5jIFNILlVzZXIuYmVjb21lXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNlc3Npb25Ub2tlbiBUaGUgc2Vzc2lvblRva2VuIHRvIGxvZyBpbiB3aXRoLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIEEgQmFja2JvbmUtc3R5bGUgb3B0aW9ucyBvYmplY3QuXG4gICAgICogQHJldHVybiB7QVYuUHJvbWlzZX0gQSBwcm9taXNlIHRoYXQgaXMgZnVsZmlsbGVkIHdpdGggdGhlIHVzZXIgd2hlblxuICAgICAqICAgICB0aGUgbG9naW4gY29tcGxldGVzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogICAgICBTSC5Vc2VyLmJlY29tZShcInNlc3Npb25Ub2tlblwiLCB7XG4gICAgICogICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCl7XG4gICAgICogICAgICAgICAgLy/mm7TmlrDmiJDlip9cbiAgICAgKiAgICAgICAgfSxcbiAgICAgKiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHVzZXIsIGVycil7XG4gICAgICogICAgICAgICAgLy9TSC5zaG93RXJyb3IoZXJyb3IpO1xuICAgICAqICAgICAgICB9XG4gICAgICogICAgICB9KTtcbiAgICAgKi9cbn0iXX0=
