def greet(name):
    """
    A simple function that returns a greeting message.
    """
    return f"Hello, {name}!"

def main():
    """
    Main function to execute the script.
    """
    message = greet("World")
    print(message)
    
    # A simple calculation
    a = 5
    b = 10
    print(f"The sum of {a} and {b} is {a + b}")

if __name__ == "__main__":
    main()
