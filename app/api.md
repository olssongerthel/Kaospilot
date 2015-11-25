### Functions
<dl>
<dt><a href="#t">t(string, [locale])</a> ⇒ <code>String</code></dt>
<dd><p>Translates a string into another language, given that a translation
is available in the locale folder.</p>
</dd>
<dt><a href="#log">log(data)</a></dt>
<dd><p>Generates a log entry.</p>
</dd>
<dt><a href="#handlebars">handlebars(options, callback)</a></dt>
<dd><p>Generates HTML by supplying the data along with a HBS template to use.</p>
</dd>
<dt><a href="#composer">composer(options, callback)</a></dt>
<dd><p>Sends an e-mail via SMTP.</p>
</dd>
<dt><a href="#kalabalik">kalabalik(options, callback)</a></dt>
<dd><p>Requests data from an instance of Kalabalik</p>
</dd>
<dt><a href="#saveToFile">saveToFile(content, filename, callback)</a></dt>
<dd><p>Saves html content to a file. Can be used to debug composer
e-mails in order to prevent sending them.</p>
</dd>
</dl>
### Typedefs
<dl>
<dt><a href="#templateCallback">templateCallback</a> : <code>function</code></dt>
<dd><p>Callback for Handlebars.</p>
</dd>
<dt><a href="#requestCallback">requestCallback</a> : <code>function</code></dt>
<dd><p>Callback for Kalabalik.</p>
</dd>
</dl>
<a name="t"></a>
### t(string, [locale]) ⇒ <code>String</code>
Translates a string into another language, given that a translation
is available in the locale folder.

**Kind**: global function  
**Returns**: <code>String</code> - The translated string.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| string | <code>String</code> |  | The translatable string. |
| [locale] | <code>Int</code> | <code>0</code> | The FDT code for the language. Is matched against the 'languages' list in the configuration file. |

<a name="log"></a>
### log(data)
Generates a log entry.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | A Winston log object. |
| data.meta | <code>Object</code> |  |
| data.meta.plugin | <code>String</code> | The human readable name of your plugin, i.e the same as exports.label from your plugin. |

<a name="handlebars"></a>
### handlebars(options, callback)
Generates HTML by supplying the data along with a HBS template to use.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.plugin | <code>String</code> | The machine readable name of the plugin. |
| options.template | <code>String</code> | The name of the template file. The file must be located in a 'templates' folder in the plugin folder and use a '.hbs' file extension. |
| [options.css] | <code>String</code> | The name of the css file incl. extension to apply inline. Must be located in a 'css' folder in the plugin folder. |
| options.data | <code>Object</code> | A javascript object containing the data. |
| callback | <code>[templateCallback](#templateCallback)</code> | A callback to run. |

<a name="composer"></a>
### composer(options, callback)
Sends an e-mail via SMTP.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| [options.transporterOpt] | <code>String</code> | A valid Nodemailer transporter options object. See Nodemailer module docs for more info. |
| options.mailoptions | <code>String</code> | A valid Nodemailer mailoptions object. See Nodemailer module docs for more info. |
| [options.debug] | <code>Boolean</code> | If true, saves the composed e-mail as a html file to the debug folder instead of sending it as an e-mail. Respects the value of the global debug setting used in the configuration file. |
| callback | <code>function</code> | A callback to run after the e-mail is sent. |

<a name="kalabalik"></a>
### kalabalik(options, callback)
Requests data from an instance of Kalabalik

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.requestUrl | <code>String</code> | The request URL incl. "/" |
| options.method | <code>String</code> | The HTTP method to use (GET, PUT) etc. |
| [options.body] | <code>String</code> | The body of the request (for PUT etc.) |
| callback | <code>[requestCallback](#requestCallback)</code> | A callback to run. |

<a name="saveToFile"></a>
### saveToFile(content, filename, callback)
Saves html content to a file. Can be used to debug composer
e-mails in order to prevent sending them.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> | The html content. |
| filename | <code>string</code> | The name of the file. |
| callback | <code>saveToFileCallback</code> | A callback to run afterwards. |

<a name="templateCallback"></a>
### templateCallback : <code>function</code>
Callback for Handlebars.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| compiled | <code>String</code> | The compiled HTML. |

<a name="requestCallback"></a>
### requestCallback : <code>function</code>
Callback for Kalabalik.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>obj</code> | An explanation of the error that occured. |
| body | <code>obj</code> | The body of the request response in JSON format. |

