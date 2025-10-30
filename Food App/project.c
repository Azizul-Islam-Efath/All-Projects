#include <stdio.h>
#include <string.h>
#include<stdlib.h>

// structure details
struct Details
{
    char username[100];
    char password1[100];
    char password2[100];
    char email[100];
    char mobile[50];
};

// structure menu
struct Menu
{
    char food[100];
    int price;
};

//menu item
struct Menu *menu_item=NULL;
int menu_size = 5;

// structure AddtoCart
struct AddtoCart
{
    char food[100];
    int price;
    int quantity;
};

// add to cart
struct AddtoCart cart[100];
int cart_size = 0;

void initialize_menu();
void homepage();
void signup();
void login();
void view_menu();
void view_cart();
void edit_cart();
void checkout();
void logout();
void remove_line(char *str);

int main()
{
    initialize_menu();
    homepage();
    return 0;
}

//initialize_menu
void initialize_menu() {
    menu_item= (struct Menu*) malloc(menu_size* sizeof(struct Menu));

    strcpy(menu_item[0].food, "Burger");
    menu_item[0].price= 100;
    strcpy(menu_item[1].food, "Pizza");
    menu_item[1].price= 250;
    strcpy(menu_item[2].food, "Pasta");
    menu_item[2].price= 150;
    strcpy(menu_item[3].food, "French Fry");
    menu_item[3].price= 90;
    strcpy(menu_item[4].food, "Soft Drinks");
    menu_item[4].price= 50;

}

// homepage function
void homepage()
{
    int choice;
    printf("\n\n_____Welcome to HabiJabi Food Corner_____\n\n");
    printf("\n1. Signup\n2. Login\n3. Exit\n");
    printf("Enter your choice: ");
    scanf("%d", &choice);

    while (1)
    {
        switch (choice)
        {
        case 1:
        {
            signup();
            break;
        }
        case 2:
        {
            login();
            break;
        }
        case 3:
        {
            logout();
            break;
        }
        default:
            printf("\nChoice is invalid\n");
            break;
        }
    }
}

// remove new line function
void remove_line(char *str)
{
    int length = strlen(str);
    if (length > 0 && str[length - 1] == '\n')
    {
        str[length - 1] = '\0';
    }
}

// sign up function
void signup()
{
    FILE *file;
    file = fopen("order.txt", "a");
    if (file == NULL)
    {
        printf("File is not available\n");
    }
    else
    {
        struct Details sign;
        printf("\n\n***Sign Up***\n\n");
        fflush(stdin);
        printf("Enter your username: ");
        fgets(sign.username, sizeof(sign.username), stdin);
        remove_line(sign.username);
        printf("Enter your email: ");
        fgets(sign.email, sizeof(sign.email), stdin);
        remove_line(sign.email);
        printf("Enter your mobile number: ");
        fgets(sign.mobile, sizeof(sign.mobile), stdin);
        remove_line(sign.mobile);

        while (1)
        {
            fflush(stdin);
            printf("Enter your password: ");
            fgets(sign.password1, sizeof(sign.password1), stdin);
            remove_line(sign.password1);

            if (strlen(sign.password1) < 6)
            {
                printf("Your password should be more than 6 digits\n");
                continue;
            }
            else
            {
                printf("Confirm Password: ");
                fgets(sign.password2, sizeof(sign.password2), stdin);
                remove_line(sign.password2);

                if (strcmp(sign.password1, sign.password2) == 0)
                {
                    break;
                }
                else
                {
                    printf("Password doesn't match\n");
                    continue;
                }
            }
        }
        fprintf(file, "%s\n%s\n%s\n%s\n", sign.username, sign.email, sign.mobile, sign.password1);
        fclose(file);

        printf("Registration Successfull!!\n");
        printf("\n\n***LogIn***\n\n");
        login();
    }
}

// login function
void login()
{
    char login_username[100];
    char login_password[100];

    struct Details log;
    FILE *file;
    file = fopen("order.txt", "r");
    if (file == NULL)
    {
        printf("File is not available\n");
    }
    else
    {
        while (1)
        {
            fflush(stdin);
            printf("Username: ");
            fgets(login_username, sizeof login_username, stdin);
            remove_line(login_username);
            printf("Password: ");
            fgets(login_password, sizeof login_password, stdin);
            remove_line(login_password);

            int found = 0; // initially found nothing
            // end of the file porjonto read krbe
            while (fscanf(file, " %[^\n] %[^\n] %[^\n] %[^\n]", log.username, log.email, log.mobile, log.password1) != EOF)
            {
                if (strcmp(log.username, login_username) == 0 && strcmp(log.password1, login_password) == 0)
                {
                    found = 1;
                    break;
                }
            }
            fclose(file);

            if (found)
            {
                printf("\n\n-----Welcom to Our Homepage------\n\n");
                view_menu();
            }
            else
            {
                printf("Invalid username or password\n");
            }
        }
    }
}

// menu function
void view_menu()
{
    int choice, quantity;

    while (1)
    {
        printf("\n\n_________Menu_________\n\n");
        for (int i = 0; i < menu_size; i++)
        {
            printf("%d. %s = %d tk\n", (i + 1), menu_item[i].food, menu_item[i].price);
        }

        do
        {
            printf("Enter the number of the iteam you want to order: ");
            if(scanf("%d", &choice) == 1)
            {
                break;
            }
            else
            {
                printf("Invalid choice. Enter valid number\n");
                while(getchar() != '\n');
            }
        }
        while (1);

        if (choice == 0)
        {
            break; // stop ordering
        }
        if (choice < 1 || choice > menu_size)
        {
            printf("Invalid choice. Please try again\n\n");
            continue;
        }

        printf("Enter quantity: ");
        scanf("%d", &quantity);

        strcpy(cart[cart_size].food, menu_item[choice-1].food);
        cart[cart_size].price= menu_item[choice-1].price;
        cart[cart_size].quantity= quantity;
        cart_size++;

        printf("Item Added. Add another or enter 0 to stop");

    }
    view_cart();
}

//view cart function
void view_cart()
{
    printf("\n\n_______Cart_______\n\n");
    if(cart_size == 0)
    {
        printf("Cart is empty\n");
    }

    int total=0;

    for(int i=0; i<cart_size; i++)
    {
        int calculate_price= cart[i].price * cart[i].quantity;

        printf("%d. %s * %d = %d tk\n", (i+1), cart[i].food, cart[i].quantity, calculate_price);
        total += calculate_price;
    }

    printf("Total ammount: %d\n", total);
    printf("\n1. Edit Cart\n2. Checkout\n3. Logout\nEnter your choice: ");

    int choice;
    scanf("%d", &choice);
    if(choice == 1)
    {
        edit_cart();
    }
    else if(choice == 2)
    {
        checkout();
        return;
    }
    else if(choice == 3)
    {
        logout();
        return;
    }
}

//edit cart function
void edit_cart()
{
    int choice, new_quantity;
    printf("\n\n_______Edit Cart_______\n\n");

    while(1)
    {
        printf("Enter the number of the item you want to edit: ");

        scanf("%d", &choice);

        if(choice == 0)
        {
            return;
        }
        else if(choice < 1 || choice > cart_size)
        {
            printf("Invalid choice. Please try again\n");
            continue;
        }

        printf("Enter new quantity: ");
        scanf("%d", &new_quantity);

        if(new_quantity == 0)
        {
            for(int i= choice - 1; i< cart_size-1; i++)
            {
                cart[i]= cart[i+1];
            }
            cart_size--;
        }
        else
        {
            cart[choice-1].quantity= new_quantity;
        }

        printf("Your Cart has been updated\n");
        view_cart();
        return;
    }
}

//checkout function
void checkout()
{
    printf("\n_______CheckOut_______\n");
    if(cart_size == 0)
    {
        printf("Your cart is empty\n");
    }

    int total= 0;
    for(int i=0; i < cart_size; i++)
    {
        total += cart[i].price * cart[i].quantity;
    }

    printf("Total ammount: %d tk\n", total);
    printf("Your order has been placed.\nThanks for your order.\n");

    cart_size=0;
    homepage();
}

//logout function
void logout()
{
    printf("You're successfully logged out\n");
    if(menu_item != NULL) {
        free(menu_item);
        menu_item= NULL;
    }
    exit(0);
}
